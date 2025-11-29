// src/lib/session.ts (React Native)

import AsyncStorage from "@react-native-async-storage/async-storage";

export type Session = { userId: string; displayName?: string };

const SESSION_KEY = "session_user";

export async function setSession(userId: string, displayName?: string): Promise<Session> {
  const s: Session = { userId, displayName };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function userKey(key: string, s: Session | null): string {
  if (!s) return key;
  return `${s.userId}:${key}`;
}

export async function setUserItem(key: string, value: string, s?: Session | null): Promise<void> {
  const session = s ?? (await getSession());
  if (!session) return;
  await AsyncStorage.setItem(userKey(key, session), value);
}

export async function getUserItem(key: string, s?: Session | null): Promise<string | null> {
  const session = s ?? (await getSession());
  if (!session) return null;
  return AsyncStorage.getItem(userKey(key, session));
}

export async function removeUserItem(key: string, s?: Session | null): Promise<void> {
  const session = s ?? (await getSession());
  if (!session) return;
  await AsyncStorage.removeItem(userKey(key, session));
}

export async function clearUserPidData(s?: Session | null): Promise<void> {
  const session = s ?? (await getSession());
  if (!session) return;
  const keys = [
    "pid_application_id",
    "pid_personal_id",
    "pid_full_name",
    "pid_mobile",
    "pid_email",
  ];
  await Promise.all(keys.map((k) => AsyncStorage.removeItem(userKey(k, session))));
}
