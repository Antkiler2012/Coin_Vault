import { ThemedText } from '@/components/themed-text'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as FileSystem from 'expo-file-system/legacy'
import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FLAG_FILE = FileSystem.documentDirectory + 'onboarding_done.txt'

export default function IntroScreen() {
  const router = useRouter()

  async function onGetStarted() {
    try {
      await FileSystem.writeAsStringAsync(FLAG_FILE, '1')
    } catch {}
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.center}>        
        <Image source={require('@/assets/images/home-coin.png')} style={styles.hero} />
        <ThemedText type="title" style={styles.title}>Welcome to CoinVault</ThemedText>
        <ThemedText style={styles.subtitle}>Identify coins, estimate value, and build your collection.</ThemedText>

        <TouchableOpacity onPress={onGetStarted} style={styles.button}>
          <MaterialIcons name="arrow-forward" size={18} color="#222" />
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hero: { width: 180, height: 180, resizeMode: 'contain', marginBottom: 16 },
  title: { color: '#2C2A2A', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderColor: '#222', borderWidth: 2, flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#222', fontWeight: '600', marginLeft: 6 },
})


