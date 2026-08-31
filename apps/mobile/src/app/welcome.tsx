import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function WelcomeScreen() {
  const { status, signInWithGoogle, signInWithApple } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  if (status === "signedIn") return <Redirect href="/" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedText type="title">SpeedySponsor</ThemedText>
          <ThemedText type="small">
            Log outreach, earn points, and turn team effort into real sponsor dollars.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttons}>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={() => signInWithGoogle().catch((err) => Alert.alert("Sign-in failed", err.message))}
          />
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={6}
              style={styles.appleButton}
              onPress={() => signInWithApple().catch((err) => Alert.alert("Sign-in failed", err.message))}
            />
          )}
        </ThemedView>
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
    justifyContent: "space-between",
    padding: Spacing.four,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  buttons: {
    gap: Spacing.three,
    alignItems: "center",
    paddingBottom: Spacing.four,
  },
  appleButton: {
    width: 192,
    height: 48,
  },
});
