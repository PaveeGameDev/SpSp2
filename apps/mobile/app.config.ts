import type { ConfigContext, ExpoConfig } from "expo/config";

// Google's iOS OAuth client ID looks like "1234-abc.apps.googleusercontent.com";
// the native SDK's URL scheme is that same ID with its dot-segments reversed:
// "com.googleusercontent.apps.1234-abc". Derived here so we only have to set
// EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID once.
//
// Falls back to the real client ID below (not a secret — it's baked into the
// compiled app either way) rather than `undefined`, because some EAS CLI
// commands (`eas init`, and any bare `expo config` it shells out to outside a
// build profile) evaluate this config with dotenv disabled entirely
// (EXPO_NO_DOTENV=1) and no eas.json `env` to fall back on — an empty
// iosUrlScheme makes the google-signin config plugin throw and hard-fails
// those commands.
const FALLBACK_IOS_CLIENT_ID = "781669030617-ioo81sqsqur72l7mi5ko5clen1kq088e.apps.googleusercontent.com";

function reversedIosClientId(clientId: string | undefined): string {
  return (clientId || FALLBACK_IOS_CLIENT_ID).split(".").reverse().join(".");
}

// Exported as a function (rather than a plain object) so `process.env` is read
// at the point Expo CLI actually invokes this config — not at module-require
// time, which can race ahead of Expo's own .env loading and see an empty env.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "SpeedySponsor",
  slug: "speedysponsor",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "speedysponsor",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
    bundleIdentifier: "com.speedysponsor.app",
    usesAppleSignIn: true,
  },
  android: {
    package: "com.speedysponsor.app",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: reversedIosClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "61ce629f-b07d-4798-b7f4-01862defc052",
    },
  },
});
