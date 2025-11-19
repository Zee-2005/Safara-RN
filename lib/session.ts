import AsyncStorage from '@react-native-async-storage/async-storage';

type Session = { userId: string; displayName?: string };

const SESSION_KEY = 'session_user';

export async function setSession(userId: string, displayName?: string): Promise<Session> {
  const s: Session = { userId, displayName };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

export async function getSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function userKey(key: string, s: Session | null): Promise<string> {
  if (!s) return key;
  return `${s.userId}:${key}`;
}

export async function setUserItem(key: string, value: string, s: Session | null) {
  if (!s) return;
  const storageKey = await userKey(key, s);
  await AsyncStorage.setItem(storageKey, value);
}

export async function getUserItem(key: string, s: Session | null): Promise<string | null> {
  if (!s) return null;
  const storageKey = await userKey(key, s);
  return AsyncStorage.getItem(storageKey);
}

export async function removeUserItem(key: string, s: Session | null) {
  if (!s) return;
  const storageKey = await userKey(key, s);
  await AsyncStorage.removeItem(storageKey);
}

export async function clearUserPidData(s: Session | null) {
  if (!s) return;
  const keys = [
    'pid_application_id',
    'pid_personal_id',
    'pid_full_name',
    'pid_mobile',
    'pid_email',
  ];
  for (const k of keys) {
    const storageKey = await userKey(k, s);
    await AsyncStorage.removeItem(storageKey);
  }
}
