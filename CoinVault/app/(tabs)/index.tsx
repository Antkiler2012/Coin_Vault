import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { LeagueSpartan_400Regular } from '@expo-google-fonts/league-spartan';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar'; // 👈 add this
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    LeagueSpartan_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#ffffff", dark: "#ffffff" }}
        headerImage={<></>}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="menu" size={22} color="#666" />
            <ThemedText style={styles.searchText}>Search for coins</ThemedText>
            <MaterialIcons name="search" size={20} color="#666" />
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

              <Link href="/scan" asChild>
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
    paddingTop: 0,
    width: '100%',
  },
  searchBox: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 100,
    top: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,

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
});
