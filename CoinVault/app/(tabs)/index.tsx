import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { LeagueSpartan_400Regular } from '@expo-google-fonts/league-spartan';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    LeagueSpartan_400Regular,
  });
  const [query, setQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  async function onSubmitSearch() {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    try {
      const { verifyQueryWithGemini } = await import('../../lib/ai');
      const verify = await verifyQueryWithGemini(q);
      const stats = await querySerpApiStats(q);
      if (!stats) return;
      const title = stats.top?.title || q;
      const avgRaw = typeof stats.avg === 'number' ? stats.avg : null;
      const { adjustPriceWithGemini } = await import('../../lib/ai');
      const avgAdjusted = await adjustPriceWithGemini(title, avgRaw);
      const image = stats.top?.thumbnail || undefined;
      router.push({ pathname: '/result', params: {
        title,
        ...(typeof avgAdjusted === 'number' ? { avg: String(avgAdjusted) } : {}),
        ...(image ? { image } : {}),
        ...(verify && verify.type ? { note: verify.type } : {}),
      }});
    } finally {
      setSearching(false);
    }
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#ffffff", dark: "#ffffff" }}
        headerImage={<></>}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="menu" size={22} color="#666" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSubmitSearch}
              placeholder="Search for coins"
              placeholderTextColor="#666"
              style={styles.searchInput}
              returnKeyType="search"
            />
            
            <TouchableOpacity onPress={onSubmitSearch} disabled={searching}>
              <MaterialIcons name="search" size={20} color="#666" />
            </TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push('/settings')} >
            <MaterialIcons name="settings" size={20} color="#666"/>
          </TouchableOpacity>
          </View>

        </View>

        <View style={styles.heroWrap}>
          <View style={styles.card}>
            <View style={styles.coinWrap} pointerEvents="none">
              <Image
                source={require("@/assets/images/home-coin.png")}
                style={styles.coin}
              />
            </View>
            <View style={styles.cardContentCenter}>
              <ThemedText type="title" style={styles.titleText}>
                Identify your coin
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Tap here to identify your coin
              </ThemedText>

              <Link href="../scan" asChild>
                <TouchableOpacity style={styles.scanButton} activeOpacity={0.9}>
                  <View style={styles.scanIconBox}>
                    <MaterialIcons name="crop-free" size={14} color="#fff" />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.scanText}>
                    Scan
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ParallaxScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  topCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    width: '105%',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    top:60,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  searchRow: {
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    bottom: 20,
  },
  searchBox: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    width: '105%',
  },
  hamburger: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  heroWrap: {
    alignItems: 'center',
    paddingVertical: 150,
  },
  coinWrap: {
    position: 'absolute',
    top: -120,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  cardContentCenter: {
    alignItems: 'center',
    paddingTop: 80,
  },
  subtitle: {
    color: '#9A9A9A',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    width: 250,
    marginBottom: 12,
  },
  scanIconPlaceholder: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  searchText: {
    color: '#666',
  },
  searchIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginLeft: 'auto',
  },
  titleText: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Inter_700Bold',
    color: '#2C2A2A',
    fontWeight: '400',
    textAlign: 'center',
  },
  scanIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
    marginRight: 8,
  },
  scanIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  scanButton: {
    marginTop: 0,
    backgroundColor: '#18161C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    marginLeft: 6,
  },
  searchInput: { flex: 1, color: '#666' },
});

async function querySerpApiStats(search: string): Promise<{
  avg: number | null,
  top?: { title?: string, source?: string, price?: number | null, link?: string, thumbnail?: string }
} | null> {
  try {
    const serpKey = process.env.EXPO_PUBLIC_SERPAPI_KEY as string | undefined;
    if (!serpKey) return null;
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: search,
      hl: 'en',
      gl: 'us',
      api_key: String(serpKey),
    });
    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const resp = await fetch(url);
    const json = await resp.json();
    const results: any[] = json?.shopping_results ?? [];
    const prices: number[] = results
      .map((r) => (typeof r?.extracted_price === 'number' ? r.extracted_price : null))
      .filter((n): n is number => typeof n === 'number');
    const count = prices.length;
    const avg = count ? prices.reduce((a, b) => a + b, 0) / count : null;
    const first = results?.[0];
    const top = first ? {
      title: first?.title,
      source: first?.source,
      price: typeof first?.extracted_price === 'number' ? first.extracted_price : null,
      link: first?.product_link,
      thumbnail: first?.thumbnail,
    } : undefined;
    return { avg, top };
  } catch {
    return null;
  }
}

// onSubmitSearch defined in component for access to state
