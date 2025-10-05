import { ThemedText } from '@/components/themed-text'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type SerpStats = {
  avg: number | null,
  min: number | null,
  max: number | null,
  count: number,
  top?: { title?: string, source?: string, price?: number | null, link?: string, image?: string | null }
}

export default function LoadingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string, year?: string }>()
  const id = useMemo(() => (typeof params.id === 'string' ? params.id : undefined), [params.id])
  const yearOverride = useMemo(() => (typeof params.year === 'string' ? params.year : undefined), [params.year])
  const [front, setFront] = useState<string | undefined>(undefined)
  const [back, setBack] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[CoinVault] Loading screen mounted. id:', id)
  }, [id])

  useEffect(() => {
    if (!front || !back) {
      if (!id) {
        setError('Missing images for analysis')
        return
      }
      console.log('[CoinVault] Loading payload id:', id)
      import('../lib/scanPayload').then(({ getScanPayload }) => {
        const payload = getScanPayload(id)
        if (!payload) {
          setError('Payload not found')
          return
        }
        setFront(payload.front)
        setBack(payload.back)
      })
      return
    }

    async function callVision(base64: string): Promise<string | null> {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY
        if (!apiKey) return null
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`
        const body = {
          requests: [
            { image: { content: base64 }, features: [{ type: 'TEXT_DETECTION' }] },
          ],
        }
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const json = await resp.json()
        const text = json?.responses?.[0]?.fullTextAnnotation?.text ?? json?.responses?.[0]?.textAnnotations?.[0]?.description ?? null
        return typeof text === 'string' ? text.trim() : null
      } catch (e) {
        return null
      }
    }

    function extractHints(frontText: string | null, backText: string | null): { year?: string, denom?: string, country?: string } {
      const combined = [frontText, backText].filter(Boolean).join(' ')
      const lower = combined.toLowerCase()
      const yearMatch = lower.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/)
      const denomTerms = [
        'peso','pesos','cent','cents','centavo','centavos','penny','pence','euro','grosz','groszy','zloty','złoty','zlotych','złotych','yen','yuan','rupee','ruble','krona','kroner','kronor','dinar','dirham','franc','mark','lira','kopeck','paise','paisa'
      ]
      const foundDenom = denomTerms.find((t) => lower.includes(t))
      let country: string | undefined
      if (/(poland|polish|polska|rzeczpospolita)/.test(lower)) country = 'poland'
      if (/(mexico|estados unidos mexicanos)/.test(lower)) country = country ?? 'mexico'
      if (/(united states|america|liberty)/.test(lower)) country = country ?? 'usa'
      return { year: yearMatch?.[1], denom: foundDenom, country }
    }

    function toQuery(frontText: string | null, backText: string | null): string {
      const combined = [frontText, backText].filter(Boolean).join(' ')
      const hints = extractHints(frontText, backText)
      if (yearOverride && /^\d{4}$/.test(yearOverride)) {
        hints.year = yearOverride
      }
      const parts: string[] = []
      if (hints.country) parts.push(hints.country)
      if (hints.denom) parts.push(hints.denom)
      if (hints.year) parts.push(hints.year)
      if (combined) parts.push(combined)
      parts.push('coin')
      parts.push('value')
      const q = parts.join(' ')
      return q
    }

    function computeRobustStats(numbers: number[]): { median: number, p25: number, p75: number, iqr: number, trimmed: number[] } {
      const arr = [...numbers].sort((a, b) => a - b)
      const q = (p: number) => {
        const idx = (arr.length - 1) * p
        const lo = Math.floor(idx)
        const hi = Math.ceil(idx)
        if (lo === hi) return arr[lo]
        return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo)
      }
      const p25 = q(0.25)
      const p75 = q(0.75)
      const iqr = p75 - p25
      const median = q(0.5)
      const lower = p25 - 1.5 * iqr
      const upper = p75 + 1.5 * iqr
      const trimmed = arr.filter((v) => v >= lower && v <= upper)
      return { median, p25, p75, iqr, trimmed }
    }

    function priceBounds(hints: { year?: string, denom?: string, country?: string }): { min?: number, max?: number } {
      const y = hints.year ? Number(hints.year) : undefined
      const d = hints.denom?.toLowerCase()
      const c = hints.country
      // Heuristic: modern base-metal small denominations should be cheap
      const isModern = y ? y >= 1990 : true
      const isSmallBase = d && ['grosz','groszy','cent','cents','centavo','centavos','penny','pence'].includes(d)
      if (isModern && isSmallBase) {
        // Poland 50 groszy specific bound
        if (c === 'poland') {
          return { min: 0.01, max: 1.5 }
        }
        return { min: 0.01, max: 2.0 }
      }
      // Default: no bounds
      return {}
    }

    async function serpStats(query: string, hints: { year?: string, denom?: string, country?: string }): Promise<SerpStats | null> {
      try {
        const serpKey = process.env.EXPO_PUBLIC_SERPAPI_KEY
        if (!serpKey) return null
        const u = new URL('https://serpapi.com/search.json')
        u.searchParams.set('engine', 'google_shopping')
        u.searchParams.set('q', query)
        u.searchParams.set('hl', 'en')
        u.searchParams.set('gl', 'us')
        u.searchParams.set('api_key', String(serpKey))
        const resp = await fetch(u.toString())
        const json = await resp.json()
        const results: any[] = json?.shopping_results ?? []

        // Keep likely coin items only; exclude jewelry/mountings/sets/replicas and graded/proof/precious metals
        const includeTerms = ['coin','pesos','peso','grosz','groszy','dos y medio','km:','mint','uncirculated']
        const excludeTerms = ['ring','bracelet','pendant','bezel','necklace','brooch','charm','chain','earring','set ','lot','roll','bulk','copy','replica','mount','framed','silver','gold','proof','pcgs','ngc','ms-','ms ']
        const isCoinResult = (title?: string): boolean => {
          if (!title) return false
          const t = title.toLowerCase()
          if (excludeTerms.some((w) => t.includes(w))) return false
          if (!includeTerms.some((w) => t.includes(w))) return false
          return true
        }
        const filtered: any[] = results.filter(r => isCoinResult(r?.title))
        if (!filtered.length) return { avg: null, min: null, max: null, count: 0 }

        const rawPrices: number[] = filtered.map(r => (typeof r?.extracted_price === 'number' ? r.extracted_price : null)).filter((n): n is number => typeof n === 'number')
        if (!rawPrices.length) return { avg: null, min: null, max: null, count: 0 }

        // Apply denomination/country/year price bounds when available
        const bounds = priceBounds(hints)
        const bounded = rawPrices.filter(p => (bounds.min == null || p >= bounds.min) && (bounds.max == null || p <= bounds.max))
        const prices = bounded.length ? bounded : rawPrices

        const { median, p25, p75, iqr, trimmed } = computeRobustStats(prices)
        const count = trimmed.length
        const est = median
        const min = count ? Math.min(...trimmed) : null
        const max = count ? Math.max(...trimmed) : null
        const first = filtered?.[0]
        const top = first ? {
          title: first?.title,
          source: first?.source,
          price: typeof first?.extracted_price === 'number' ? first.extracted_price : null,
          link: first?.product_link,
          image: first?.thumbnail ?? first?.serpapi_thumbnail ?? null,
        } : undefined
        console.log('[CoinVault] Stats -> median:', est, 'p25:', p25, 'p75:', p75, 'iqr:', iqr, 'trimmedCount:', count, 'bounds:', bounds)
        return { avg: est, min, max, count, top }
      } catch (e) {
        return null
      }
    }

    async function geminiVerifySingleCoin(frontB64: string, backB64: string, estUsd: number | null, titleHint?: string): Promise<{ singleCoin: boolean, verdict?: string, reason?: string } | null> {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY
        if (!apiKey) return null
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`
        const prompt = `You are a numismatics assistant. Verify that the two images show a single coin (not jewelry, not multiple coins, not sets, not bulk). Then assess whether the estimated market value in USD seems reasonable given typical online listings. Respond ONLY as compact JSON with keys: singleCoin (boolean), reason (string <=120 chars), verdict (one of: "low", "fair", "high"). Title hint (optional): ${titleHint ?? ''}. Estimated value: ${estUsd ?? 'unknown'}`
        const body = {
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/jpeg', data: frontB64 } },
                { inline_data: { mime_type: 'image/jpeg', data: backB64 } },
              ],
            },
          ],
        }
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const json = await resp.json()
        const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) return null
        let parsed: any
        try {
          parsed = JSON.parse(text)
        } catch {
          // try to extract json block
          const match = text.match(/\{[\s\S]*\}/)
          if (match) {
            parsed = JSON.parse(match[0])
          }
        }
        if (!parsed) return null
        const singleCoin = Boolean(parsed.singleCoin)
        const verdict = typeof parsed.verdict === 'string' ? parsed.verdict : undefined
        const reason = typeof parsed.reason === 'string' ? parsed.reason : undefined
        return { singleCoin, verdict, reason }
      } catch (e) {
        return null
      }
    }

    (async () => {
      try {
        console.log('[CoinVault] Calling Vision API...')
        const [frontText, backText] = await Promise.all([callVision(front), callVision(back)])
        const hints = extractHints(frontText, backText)
        if (yearOverride && /^\d{4}$/.test(yearOverride)) hints.year = yearOverride
        const query = toQuery(frontText, backText)
        console.log('[CoinVault] Querying SerpAPI with:', query)
        const stats = await serpStats(query, hints)
        if (!stats || stats.count === 0 || !stats.top || stats.avg == null) {
          setError('No coin results found')
          return
        }

        // Gemini verification step
        const gem = await geminiVerifySingleCoin(front!, back!, stats.avg, stats.top?.title)
        if (gem) {
          console.log('[CoinVault] Gemini verify => singleCoin:', gem.singleCoin, 'verdict:', gem.verdict, 'reason:', gem.reason)
          if (!gem.singleCoin) {
            setError('Detected multiple items or not a single coin')
            return
          }
        } else {
          console.log('[CoinVault] Gemini verification unavailable; continuing')
        }

        router.replace({ pathname: '/result', params: {
          title: String(stats.top.title ?? ''),
          avg: String(stats.avg),
          image: String(stats.top.image ?? ''),
        } })
      } catch (e) {
        setError('Failed to analyze')
      }
    })()
  }, [front, back, id, router])

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C2A2A" />
        <ThemedText style={styles.text}>Analyzing your coin...</ThemedText>
        {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: '#2C2A2A', marginTop: 12 },
  error: { color: 'orange', marginTop: 8 },
})


