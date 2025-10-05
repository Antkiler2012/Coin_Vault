import { ThemedText } from '@/components/themed-text'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ResultScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ title?: string; avg?: string; image?: string }>()
  const title = useMemo(() => (typeof params.title === 'string' ? params.title : ''), [params.title])
  const avg = useMemo(() => (typeof params.avg === 'string' ? Number(params.avg) : NaN), [params.avg])
  const image = useMemo(() => (typeof params.image === 'string' ? params.image : ''), [params.image])

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        {!!image && (
          <Image source={{ uri: image }} style={styles.hero} />
        )}
        <ThemedText type="title" style={styles.title}>{title || 'Coin'}</ThemedText>
        {!Number.isNaN(avg) && (
          <ThemedText style={styles.value}>Estimated Average Value: ${avg.toFixed(2)}</ThemedText>
        )}

        <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
          <ThemedText style={styles.buttonText}>Done</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C2A2A' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hero: { width: 220, height: 220, borderRadius: 12, marginBottom: 16 },
  title: { color: '#fff', textAlign: 'center', marginBottom: 8 },
  value: { color: '#ddd', marginBottom: 24 },
  button: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24 },
  buttonText: { color: '#222', fontWeight: '600' },
})


