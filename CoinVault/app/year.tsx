import { ThemedText } from '@/components/themed-text'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, } from 'react-native-safe-area-context'

export default function YearScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()
  const id = useMemo(() => (typeof params.id === 'string' ? params.id : undefined), [params.id])
  const [year, setYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit() {
    if (!id) {
      setError('Missing scan session')
      return
    }
    const y = year.trim()
    if (!/^\d{4}$/.test(y)) {
      setError('Enter a 4-digit year')
      return
    }
    setError(null)
    router.replace({ pathname: '/loading', params: { id, year: y } })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.card}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        
        <ThemedText type="title" style={styles.title}>Enter coin year</ThemedText>
        <TextInput
          value={year}
          onChangeText={setYear}
          placeholder="e.g. 2022"
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
          placeholderTextColor="#888"
        />
      
        {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <TouchableOpacity onPress={onSubmit} style={[styles.button, (!/^\d{4}$/.test(year.trim())) && { opacity: 0.6 }]} disabled={!/^\d{4}$/.test(year.trim())}>
          <ThemedText style={styles.buttonText}>Continue</ThemedText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', alignItems: 'center',  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#666', marginBottom: 12, textAlign: 'center' ,},
  input: {
    width: 160,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 18,
  },
  card: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingVertical: 20,
    height: 300,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    top:250,
  },
  button: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24 },
  buttonText: { color: '#222', fontWeight: '600' },
  error: { color: 'orange', marginBottom: 12 },
})


