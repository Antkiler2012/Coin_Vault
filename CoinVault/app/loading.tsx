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
  const params = useLocalSearchParams<{ front?: string; back?: string }>()
  const front = useMemo(() => (typeof params.front === 'string' ? params.front : undefined), [params.front])
  const back = useMemo(() => (typeof params.back === 'string' ? params.back : undefined), [params.back])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!front || !back) {
      setError('Missing images for analysis')
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

    function toQuery(frontText: string | null, backText: string | null): string {
      const combined = [frontText, backText].filter(Boolean).join(' ')
      return combined ? `${combined} value` : 'gold coin value'
    }

    async function serpStats(query: string): Promise<SerpStats | null> {
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
        const prices: number[] = results.map(r => (typeof r?.extracted_price === 'number' ? r.extracted_price : null)).filter((n): n is number => typeof n === 'number')
        const count = prices.length
        const avg = count ? prices.reduce((a, b) => a + b, 0) / count : null
        const min = count ? Math.min(...prices) : null
        const max = count ? Math.max(...prices) : null
        const first = results?.[0]
        const top = first ? {
          title: first?.title,
          source: first?.source,
          price: typeof first?.extracted_price === 'number' ? first.extracted_price : null,
          link: first?.product_link,
          image: first?.thumbnail ?? first?.serpapi_thumbnail ?? null,
        } : undefined
        return { avg, min, max, count, top }
      } catch (e) {
        return null
      }
    }

    (async () => {
      try {
        const [frontText, backText] = await Promise.all([callVision(front), callVision(back)])
        const query = toQuery(frontText, backText)
        const stats = await serpStats(query)
        if (!stats || !stats.top || stats.avg == null) {
          setError('No results found')
          return
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
  }, [front, back, router])

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <ThemedText style={styles.text}>Analyzing your coin...</ThemedText>
        {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C2A2A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: '#fff', marginTop: 12 },
  error: { color: 'orange', marginTop: 8 },
})


