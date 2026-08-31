import * as SecureStore from "expo-secure-store";
import type { UserDTO } from "@sponsor/shared";

const SESSION_KEY = "sponsor_session";

export interface StoredSession {
  token: string;
  user: UserDTO;
}

export const authStorage = {
  async get(): Promise<StoredSession | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  },
  async set(session: StoredSession) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },
  async clear() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
