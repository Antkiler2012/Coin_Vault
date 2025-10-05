import { ThemedText } from '@/components/themed-text'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useMemo, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

async function addCoin(title: string, avg: number | null, image?: string) {
  const mod = await import('../lib/collection')
  await mod.addToCollection({ title, avg, image })
}

export default function ResultScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ title?: string; avg?: string; image?: string; note?: string }>()
  const title = useMemo(() => (typeof params.title === 'string' ? params.title : ''), [params.title])
  const avg = useMemo(() => (typeof params.avg === 'string' ? Number(params.avg) : NaN), [params.avg])
  const image = useMemo(() => (typeof params.image === 'string' ? params.image : ''), [params.image])
  const note = useMemo(() => (typeof params.note === 'string' ? params.note : ''), [params.note])
  const [saving, setSaving] = useState(false)

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
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
        {!!note && (
          <ThemedText style={styles.note}>Note: {note === 'set' ? 'Query looks like a set/lot' : note === 'jewelry' ? 'Query may refer to jewelry' : note}</ThemedText>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            disabled={saving}
            onPress={async () => {
              if (saving) return
              setSaving(true)
              try {
                await addCoin(title || 'Coin', Number.isNaN(avg) ? null : avg, image)
              } finally {
                setSaving(false)
              }
            }}
            style={[styles.button, { flexDirection: 'row', alignItems: 'center' }]}
          >
            <MaterialIcons name="add-circle" size={18} color="#222" />
            <ThemedText style={[styles.buttonText, { marginLeft: 6 }]}>{saving ? 'Adding...' : 'Add to collection'}</ThemedText>
          </TouchableOpacity>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#EDEDED', borderColor: '#222', borderWidth: 2 }]}> 
              <ThemedText style={styles.buttonText}>View collection</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity onPress={() => router.replace('/')} style={[styles.button, { marginTop: 14, alignSelf: 'center' }]}>
          <ThemedText style={styles.buttonText}>Done</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
      </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hero: { width: 220, height: 220, borderRadius: 12, marginBottom: 16 },
  title: { color: '#2C2A2A', textAlign: 'center', marginBottom: 8, fontSize: 24, fontFamily: 'Inter_bold', fontWeight: '700', width: 440 },
  value: { color: '#6e6d6dff', marginBottom: 24, textAlign: 'center', fontFamily: 'Inter_medium', fontWeight: '500', fontSize: 13 },
  note: { color: '#a67c00', marginBottom: 12, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  button: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderColor: '#222', borderWidth: 2 },
  buttonText: { color: '#2C2A2A', fontWeight: '600', fontSize: 14, fontFamily: 'Inter_medium' },
})


