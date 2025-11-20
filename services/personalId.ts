// services/personalId.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// Adjust this URL for your backend's LAN/IP or production URL!
// const BASE = 'https://safara-backend.onrender.com/api/v1/auth';
const BASE = 'http://192.168.0.103:3000/api/v1/pid';

export async function fetchAndSyncPersonalIdByEmail(email: string) {
  try {
    const res = await fetch(`${BASE}/mine?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Store all relevant fields for this user for smooth state after login
    await AsyncStorage.setItem(`pid_personal_id:${email}`, data.personalId || "");
    await AsyncStorage.setItem(`pid_full_name:${email}`, data.name || "");
    await AsyncStorage.setItem(`pid_dob:${email}`, data.dob || "");
    await AsyncStorage.setItem(`pid_email:${email}`, data.email || "");
    await AsyncStorage.setItem(`pid_mobile:${email}`, data.mobile || "");
    return data; // You may use this for immediate setState if needed
  } catch (e) {
    return null;
  }
}
