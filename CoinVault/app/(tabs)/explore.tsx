import { ThemedText } from '@/components/themed-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adjustPriceWithGemini } from '../../lib/ai';

type Item = {
  id: string;
  title: string;
  avg?: number | null;
  image?: string;
  addedAt: number;
};

export default function CollectionScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('../../lib/collection');
      const list = await mod.getCollection();
      if (mounted) setItems(list);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalMinMax = useMemo(() => {
    const prices = items.map((i) => i.avg).filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));
    if (!prices.length) return { min: 0, max: 0 };
    const min = prices.reduce((a, b) => a + b * 0.5, 0); // rough range +/- 50%
    const max = prices.reduce((a, b) => a + b * 1.5, 0);
    return { min, max };
  }, [items]);

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

  async function onSubmitSearch() {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    try {
      const stats = await querySerpApiStats(q);
      if (!stats) return;
      const title = stats.top?.title || q;
      const avgRaw = typeof stats.avg === 'number' ? stats.avg : null;
      const avg = await adjustPriceWithGemini(title, avgRaw);
      const image = stats.top?.thumbnail || undefined;
      router.push({ pathname: '/result', params: {
        title,
        ...(typeof avg === 'number' ? { avg: String(avg) } : {}),
        ...(image ? { image } : {}),
      }});
    } finally {
      setSearching(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.listCard}>
        {loading ? (
          <ThemedText style={{ textAlign: 'center', padding: 16 }}>Loading...</ThemedText>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const renderRightActions = () => (
                <TouchableOpacity
                  onPress={async () => {
                    const mod = await import('../../lib/collection');
                    await mod.removeFromCollection(item.id);
                    setItems((prev) => prev.filter((i) => i.id !== item.id));
                  }}
                  style={styles.deleteAction}
                >
                  <MaterialIcons name="delete" size={22} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              );
              return (
                <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
                  <View style={styles.row}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.thumb} />
                    ) : (
                      <View style={[styles.thumb, { backgroundColor: '#ddd' }]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.subtitle}>Added {new Date(item.addedAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.price}>{typeof item.avg === 'number' && !Number.isNaN(item.avg) ? `${(item.avg*0.5).toFixed(0)}€–${(item.avg*1.5).toFixed(0)}€` : '—'}</Text>
                  </View>
                </Swipeable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ padding: 12 }}
          />
        )}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total collection value:</Text>
          <Text style={styles.totalValue}>{`${totalMinMax.min.toFixed(0)}€–${totalMinMax.max.toFixed(0)}€`}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  searchText: { color: '#666' },
  searchInput: { flex: 1, color: '#222', marginHorizontal: 4 },
  listCard: {
    margin: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  thumb: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  title: { color: '#222', fontWeight: '600' },
  subtitle: { color: '#666', fontSize: 12, marginTop: 2 },
  price: { color: '#25A55A', fontWeight: '700' },
  totalBox: { alignItems: 'center', paddingVertical: 16 },
  totalLabel: { color: '#222', fontWeight: '600', marginBottom: 6 },
  totalValue: { color: '#25A55A', fontWeight: '800', fontSize: 18 },
  deleteAction: {
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteText: { color: '#fff', marginTop: 4, fontWeight: '600' },
});
