import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initialRoute, setInitialRoute] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const FS: any = await import('expo-file-system/legacy');
      const FLAG_FILE = FS.documentDirectory + 'onboarding_done.txt';
      try {
        const info = await FS.getInfoAsync(FLAG_FILE);
        if (!mounted) return;
        setInitialRoute(info.exists ? '(tabs)' : 'intro');
      } catch {
        if (!mounted) return;
        setInitialRoute('intro');
      }
    })();
    return () => { mounted = false };
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="year" options={{ headerShown: true }} />
          <Stack.Screen name="intro" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
