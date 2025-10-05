import { ThemedText } from "@/components/themed-text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

async function clearAllData() {
  try {
    const FS: any = await import("expo-file-system/legacy");
    const collectionPath = FS.documentDirectory + "collection.json";
    const onboardingFlag = FS.documentDirectory + "onboarding_done.txt";
    try {
      const info = await FS.getInfoAsync(collectionPath);
      if (info.exists)
        await FS.deleteAsync(collectionPath, { idempotent: true });
    } catch {}
    try {
      const info = await FS.getInfoAsync(onboardingFlag);
      if (info.exists)
        await FS.deleteAsync(onboardingFlag, { idempotent: true });
    } catch {}
    const scan = await import("../lib/scanPayload");
    scan.clearScanPayloads();
  } catch {}
}

export default function SettingsScreen() {
  const router = useRouter();

  function onResetPress() {
    Alert.alert(
      "Reset all data?",
      "This will delete your collection and reset onboarding.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            router.replace("/intro");
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Settings" }} />
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={onResetPress}>
          <MaterialIcons name="delete-forever" size={22} color="#D9534F" />
          <ThemedText style={styles.rowText}>Reset all data</ThemedText>
        </TouchableOpacity>
        <ThemedText style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
          This will delete your entire coin collection and reset the onboarding
          process. This action cannot be undone.
        </ThemedText>
      </View>
 <View style={styles.About}>
      <Text style={styles.AboutText}>
        Made with ❤️ by Antoni Wrzesinski.{'\n'}
        MIT License.
        Source code on{' '}
        <Text
          style={styles.Link}
          onPress={() => Linking.openURL('https://github.com/...')}
        >
          GitHub
        </Text>
        .{'\n'}
        Version 1.0.0
      </Text>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    margin: 16,
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  rowText: { marginLeft: 10, color: "#222", fontWeight: "600" },
About: {
  display: 'flex',
    position: 'absolute',
    bottom: 10,
    marginTop: 20,
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    width: '100%',
  },
  AboutText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 7,
    width: '100%',
    lineHeight: 22,
  },
   Link: {
    color: 'orange', // your favorite color
    textDecorationLine: 'underline',
  },
});
