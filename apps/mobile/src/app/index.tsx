import { Redirect } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const { status, user, signOut } = useAuth();

  if (status === "loading") return null;
  if (status === "signedOut" || !user) return <Redirect href="/welcome" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">SpeedySponsor</ThemedText>
        <ThemedText type="subtitle">Signed in as {user.name}</ThemedText>
        <ThemedText type="small">{user.email}</ThemedText>
        <ThemedText type="small">
          {user.totalPoints} all-time pts · {user.monthlyPoints} this month · tier: {user.currentTier}
        </ThemedText>
        <Pressable onPress={() => signOut()}>
          <ThemedText type="link">Sign out</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
