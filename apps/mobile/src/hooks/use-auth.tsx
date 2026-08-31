import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import type { AuthCallbackRequest, AuthCallbackResponse, UserDTO } from "@sponsor/shared";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

interface AuthContextValue {
  status: "loading" | "signedOut" | "signedIn";
  user: UserDTO | null;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    authStorage.get().then((session) => {
      if (session) {
        setUser(session.user);
        setToken(session.token);
        setStatus("signedIn");
      } else {
        setStatus("signedOut");
      }
    });
  }, []);

  async function completeSignIn(body: AuthCallbackRequest) {
    const response = await apiFetch<AuthCallbackResponse>("/api/auth/callback", {
      method: "POST",
      body,
    });
    await authStorage.set({ token: response.token, user: response.user });
    setUser(response.user);
    setToken(response.token);
    setStatus("signedIn");
  }

  async function signInWithGoogle() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return; // user cancelled
    if (!response.data.idToken) throw new Error("Google did not return an ID token");
    await completeSignIn({ provider: "google", idToken: response.data.idToken });
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("Apple did not return an identity token");
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ")
        : undefined;
      await completeSignIn({ provider: "apple", idToken: credential.identityToken, name: name || undefined });
    } catch (err) {
      if ((err as { code?: string }).code === "ERR_REQUEST_CANCELED") return; // user cancelled
      throw err;
    }
  }

  async function signOut() {
    if (await GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
    await authStorage.clear();
    setUser(null);
    setToken(null);
    setStatus("signedOut");
  }

  const value = useMemo(
    () => ({ status, user, token, signInWithGoogle, signInWithApple, signOut }),
    [status, user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { isErrorWithCode, statusCodes };
