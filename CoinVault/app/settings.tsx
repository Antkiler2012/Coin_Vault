import { ThemedText } from '@/components/themed-text'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

async function clearAllData() {
  try {
    const FS: any = await import('expo-file-system/legacy')
    const collectionPath = FS.documentDirectory + 'collection.json'
    const onboardingFlag = FS.documentDirectory + 'onboarding_done.txt'
    try { const info = await FS.getInfoAsync(collectionPath); if (info.exists) await FS.deleteAsync(collectionPath, { idempotent: true }) } catch {}
    try { const info = await FS.getInfoAsync(onboardingFlag); if (info.exists) await FS.deleteAsync(onboardingFlag, { idempotent: true }) } catch {}
    const scan = await import('../lib/scanPayload')
    scan.clearScanPayloads()
  } catch {}
}

export default function SettingsScreen() {
  const router = useRouter()

  function onResetPress() {
    Alert.alert('Reset all data?', 'This will delete your collection and reset onboarding.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        await clearAllData()
        router.replace('/intro')
      }},
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={onResetPress}>
          <MaterialIcons name="delete-forever" size={22} color="#D9534F" />
          <ThemedText style={styles.rowText}>Reset all data</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { margin: 16, backgroundColor: '#F2F2F2', borderRadius: 16, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 12, borderRadius: 12 },
  rowText: { marginLeft: 10, color: '#222', fontWeight: '600' },
})


