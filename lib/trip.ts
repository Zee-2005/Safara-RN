// src/lib/trip.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TripMode = 'agencies' | 'ai' | 'direct';

export type TripDraft = {
  mode: TripMode;
  startNow?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  destination?: string | null;
  itinerary?: string | null;
  agencyId?: string | null;
  homeCity?: string | null;
};

// The keys you'll use in AsyncStorage for each draft field
const KEYS = [
  'trip_mode',
  'trip_start_now',
  'trip_start',
  'trip_end',
  'trip_destination',
  'trip_itinerary',
  'trip_agency',
  'trip_home_city'
];

// Save a draft for a user's email
export async function saveTripDraft(email: string, d: TripDraft) {
  await AsyncStorage.setItem(`trip_mode:${email}`, d.mode);
  await AsyncStorage.setItem(`trip_start_now:${email}`, d.startNow ? '1' : '0');
  await AsyncStorage.setItem(`trip_start:${email}`, d.startDate || '');
  await AsyncStorage.setItem(`trip_end:${email}`, d.endDate || '');
  await AsyncStorage.setItem(`trip_destination:${email}`, d.destination || '');
  await AsyncStorage.setItem(`trip_itinerary:${email}`, d.itinerary || '');
  await AsyncStorage.setItem(`trip_agency:${email}`, d.agencyId || '');
  if (d.homeCity !== undefined) {
    await AsyncStorage.setItem(`trip_home_city:${email}`, d.homeCity || '');
  }
}

// Read a draft for a user's email
export async function readTripDraft(email: string): Promise<TripDraft> {
  const [
    mode,
    startNow,
    startDate,
    endDate,
    destination,
    itinerary,
    agencyId,
    homeCity,
  ] = await Promise.all(KEYS.map(key => AsyncStorage.getItem(`${key}:${email}`)));

  return {
    mode: (mode as TripMode) || 'direct',
    startNow: startNow === '1',
    startDate: startDate || null,
    endDate: endDate || null,
    destination: destination || null,
    itinerary: itinerary || null,
    agencyId: agencyId || null,
    homeCity: homeCity || null,
  };
}

// Clear a trip draft for a user's email
export async function clearTripDraft(email: string) {
  await Promise.all(KEYS.map(key => AsyncStorage.removeItem(`${key}:${email}`)));
}
