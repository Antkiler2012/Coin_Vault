import { ThemedText } from '@/components/themed-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const router = useRouter()
  const [step, setStep] = useState<'front' | 'back' | 'done'>('front')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraType, setCameraType] = useState<CameraType>('back')
  const cameraRef = useRef<CameraView | null>(null)
  const pulse = useRef(new Animated.Value(1)).current
  const circleScale = useRef(new Animated.Value(1)).current
  const [cameraPermission, requestPermission] = useCameraPermissions()
  const [manualRequestError, setManualRequestError] = useState<string | null>(null)
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [frontBase64, setFrontBase64] = useState<string | null>(null)
  const [backBase64, setBackBase64] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!cameraPermission) return
    if (cameraPermission.status === 'undetermined') {
      requestPermission()
        .then((r: any) => {
          const s = r?.status ?? r?.permission?.status ?? 'denied'
          setHasPermission(s === 'granted')
        })
        .catch(() => setHasPermission(false))
      return
    }
    setHasPermission(cameraPermission.status === 'granted')
  }, [cameraPermission, requestPermission])

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start()
  }, [pulse])



  const onCancel = () => router.replace('/(tabs)');
  async function analyzeImageAsync(base64: string) {
    try {
      setIsAnalyzing(true)
      
      // Play the animation when analyzing
      Animated.sequence([
        Animated.timing(circleScale, { toValue: 1.12, duration: 220, useNativeDriver: true }),
        Animated.timing(circleScale, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start()
      
      // Set captured base64 for current step and advance
      if (step === 'front') setFrontBase64(base64)
      if (step === 'back') setBackBase64(base64)

      if (step === 'front') setStep('back')
      else if (step === 'back') setStep('done')

      return { success: true, step }
    } catch (err) {
      console.warn('analyzeImageAsync error', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function callVisionApiOnBase64(base64: string): Promise<string | null> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY
      if (!apiKey) {
        console.warn('Missing EXPO_PUBLIC_GOOGLE_VISION_API_KEY')
        return null
      }
      const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`
      const requestBody = {
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const json = await resp.json()
      const text = json?.responses?.[0]?.fullTextAnnotation?.text ?? json?.responses?.[0]?.textAnnotations?.[0]?.description ?? null
      return typeof text === 'string' ? text.trim() : null
    } catch (e) {
      console.warn('callVisionApiOnBase64 error', e)
      return null
    }
  }

  function toQueryFromTexts(frontText: string | null, backText: string | null): string {
    const combined = [frontText, backText].filter(Boolean).join(' ')
    if (!combined) return 'gold coin value'
    return `${combined} value`
  }

  async function querySerpApiAveragePrice(query: string): Promise<number | null> {
    try {
      const serpKey = process.env.EXPO_PUBLIC_SERPAPI_KEY
      if (!serpKey) {
        console.warn('Missing EXPO_PUBLIC_SERPAPI_KEY')
        return null
      }
      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        hl: 'en',
        gl: 'us',
        api_key: String(serpKey),
      })
      const url = `https://serpapi.com/search.json?${params.toString()}`
      const resp = await fetch(url)
      const json = await resp.json()
      const results: any[] = json?.shopping_results ?? []
      const prices: number[] = results
        .map((r) => (typeof r?.extracted_price === 'number' ? r.extracted_price : null))
        .filter((n): n is number => typeof n === 'number')
      if (!prices.length) return null
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length
      return avg
    } catch (e) {
      console.warn('querySerpApiAveragePrice error', e)
      return null
    }
  }

  async function querySerpApiStats(query: string): Promise<{
    avg: number | null,
    min: number | null,
    max: number | null,
    count: number,
    top?: { title?: string, source?: string, price?: number | null, link?: string }
  } | null> {
    try {
      const serpKey = process.env.EXPO_PUBLIC_SERPAPI_KEY
      if (!serpKey) {
        console.warn('Missing EXPO_PUBLIC_SERPAPI_KEY')
        return null
      }
      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        hl: 'en',
        gl: 'us',
        api_key: String(serpKey),
      })
      const url = `https://serpapi.com/search.json?${params.toString()}`
      const resp = await fetch(url)
      const json = await resp.json()
      const results: any[] = json?.shopping_results ?? []
      const prices: number[] = results
        .map((r) => (typeof r?.extracted_price === 'number' ? r.extracted_price : null))
        .filter((n): n is number => typeof n === 'number')

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
      } : undefined

      return { avg, min, max, count, top }
    } catch (e) {
      console.warn('querySerpApiStats error', e)
      return null
    }
  }

  async function submitFinalAnalysis() {
    if (isSubmitting) return
    if (!frontBase64 || !backBase64) return
    setIsSubmitting(true)
    try {
      const [frontText, backText] = await Promise.all([
        callVisionApiOnBase64(frontBase64),
        callVisionApiOnBase64(backBase64),
      ])
      const query = toQueryFromTexts(frontText, backText)

      console.log('[CoinVault] Vision text (front):', frontText || '(none)')
      console.log('[CoinVault] Vision text (back):', backText || '(none)')
      console.log('[CoinVault] Combined query:', query)

      const stats = await querySerpApiStats(query)
      if (stats) {
        if (stats.top) {
          console.log('[CoinVault] Inferred coin (top result):', stats.top.title || '(unknown)')
          console.log('[CoinVault] Source:', stats.top.source || '(unknown)')
          if (typeof stats.top.price === 'number') {
            console.log('[CoinVault] Top price:', stats.top.price)
          }
          if (stats.top.link) console.log('[CoinVault] Top link:', stats.top.link)
        }
        if (stats.count > 0) {
          console.log('[CoinVault] Price stats from', stats.count, 'listings =>', 'min:', stats.min, 'avg:', stats.avg, 'max:', stats.max)
        } else {
          console.log('[CoinVault] No listings with prices found for query')
        }
      } else {
        console.log('[CoinVault] SerpAPI stats unavailable for query')
      }
    } catch (e) {
      console.warn('submitFinalAnalysis error', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onCapturePress() {
    if (isAnalyzing) return
    const refToUse = cameraRef.current
    if (!refToUse) {
      console.warn('capture error no ref')
      return
    }
    try {
      const photo = await refToUse.takePictureAsync({ base64: true, quality: 1.0, skipProcessing: false })
      if (photo?.uri) setLastPhotoUri(photo.uri)
      if (photo?.base64) {
        const r = await analyzeImageAsync(photo.base64)
        // If we just completed both sides (previous step was 'back'), trigger submission
        if (r?.success && r?.step === 'back') {
          // Next tick after state updates
          setTimeout(() => {
            submitFinalAnalysis()
          }, 0)
        }
      } else console.warn('No base64 in photo', photo)
    } catch (err) {
      console.warn('capture error', err)
    }
  }

  async function manualRequest() {
    setManualRequestError(null)
    try {
      const r = await requestPermission()
      console.log('manual requestPermission', r)
      return r
    } catch (err) {
      console.warn('manualRequest error', err)
      setManualRequestError(String((err as Error)?.message ?? err))
    }
  }

  function openSettings() {
    if (Platform.OS === 'web') return
    Linking.openSettings?.()
  }

  function openDevClientDocs() {
    const url = 'https://docs.expo.dev/development/getting-started/'
    Linking.openURL(url).catch(() => {})
  }

  async function onDonePress() {
  if (isNavigating) return;
  if (!frontBase64 || !backBase64) {
    console.warn('Cannot proceed: missing one or both images');
    return;
  }
  try {
    setIsNavigating(true);
    const { putScanPayload } = await import('../lib/scanPayload');
    const id = putScanPayload({ front: frontBase64, back: backBase64 });
    router.push({ pathname: '/year', params: { id } });
  } catch (e) {
    console.warn('Failed to stage payload', e);
    setIsNavigating(false);
  }
}




  return (
    <SafeAreaView style={styles.container}>
       <StatusBar style="light" backgroundColor="#ffffff" />
      <Stack.Screen options={{ headerShown: false }} />
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            onBarcodeScanned={(evt) => {
            }}
            enableTorch={torchOn}
            zoom={0.2}
            ratio="4:3"
          />
          <View style={styles.headerRow} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => {
                setCameraType((t) => (t === 'back' ? 'front' : 'back'))
              }}
              style={[styles.closeButton, { marginRight: 10 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="flip-camera-ios" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTorchOn((v) => !v)}
              style={[styles.closeButton, { marginRight: 10 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name={torchOn ? 'flash-on' : 'flash-off'} size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <MaterialIcons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {lastPhotoUri && (
            <View style={styles.previewWrap} pointerEvents="none">
              <Image source={{ uri: lastPhotoUri }} style={styles.previewImage} />
            </View>
          )}
          
          {step !== 'done' && (
            <TouchableOpacity 
              onPress={onCapturePress} 
              style={styles.hiddenCaptureButton}
              disabled={isAnalyzing}
            >
              <View style={[styles.captureInner, isAnalyzing && { backgroundColor: '#999' }]} />
            </TouchableOpacity>
          )}
        </>
       


      <View style={styles.overlay} pointerEvents={'box-none'}>
        <ThemedText type="title" style={styles.title}>
          {step === 'front' && 'Scan the front side of your coin'}
          {step === 'back' && 'Scan the back side of your coin'}
          {step === 'done' && 'Scan complete'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {step === 'done' 
            ? 'Both sides have been scanned successfully!' 
            : `Place the ${step === 'front' ? 'front' : 'back'} side of your coin inside the circle and tap anywhere to capture`}
        </ThemedText>

        <View style={styles.circleRow}>
          <Animated.View style={[styles.pulse, { transform: [{ scale: pulse }] }]} />
          <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }] }]} />
          {step !== 'done' && (
            <View style={styles.hintCheckWrap} pointerEvents="none">
              {step === 'back' && <MaterialIcons name="check-circle" size={36} color={'#26A65B'} />}
              {isAnalyzing && (
                <View style={styles.analyzingContainer}>
                  <MaterialIcons name="hourglass-empty" size={24} color={'#fff'} />
                  <Text style={styles.analyzingText}>Analyzing...</Text>
                </View>
              )}
            </View>
          )}
        </View>


        {step === 'done' && (
          <View style={styles.doneBox}>
            <ThemedText style={styles.doneText}>Both sides scanned</ThemedText>
            <TouchableOpacity onPress={onDonePress} style={[styles.doneLink, (!frontBase64 || !backBase64 || isNavigating) && { opacity: 0.5 }]} disabled={!frontBase64 || !backBase64 || isNavigating}>
              <Text style={styles.doneLinkText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>


    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2C2A2A", paddingTop: 0 },
  headerRow: {
    height: 44,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    position: "absolute",
    top: 40,
    zIndex: 100,
  },
  closeButton: { padding: 8 },
  camera: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  overlay: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    justifyContent: "center",
    zIndex: 40,
  },
  title: { color: "#fff", fontSize: 20, textAlign: "center" },
  subtitle: {
    color: "#ddd",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  circleRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 260,
    marginBottom: 100,
  },
  pulse: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(0,200,0,0.06)",
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  hintCheckWrap: { position: "absolute", top: -40, alignItems: "center" },
  analyzingContainer: { alignItems: "center", marginTop: 8 },
  analyzingText: { color: "#fff", fontSize: 12, marginTop: 4 },
  doneBox: { marginTop: 18, alignItems: "center" },
  doneText: { color: "#fff", marginBottom: 8 },
  doneLink: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  doneLinkText: { color: "#222", fontWeight: "600" },
  permissionCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  permissionText: { color: "#fff" },
  requestButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2A7",
    borderRadius: 8,
  },
  hiddenCaptureButton: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
    width: "100%",
    height: 80,
    justifyContent: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222",
  },
  previewWrap: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 0,
    alignItems: "flex-start",
    zIndex: 20,
  },
  previewImage: {
    alignItems: "center",
    justifyContent: "center",
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
