// src/lib/tourist.service.ts
import { getSession } from '@/lib/session';

const BASE = 'https://safara-backend.onrender.com//api/v1/tourist';

async function authHeaders(): Promise<Record<string, string>> {
  const s = await getSession();
  const h: Record<string, string> = {};
  if (s?.userId) h['x-user-id'] = s.userId;
  return h;
}

async function jsonHeaders(): Promise<Record<string, string>> {
  const h = await authHeaders();
  return { 'Content-Type': 'application/json', ...h };
}

async function parse(res: Response) {
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let msg = `${res.status} ${res.statusText}`;
    try {
      msg = ct.includes('application/json') ? (await res.json())?.error || msg : (await res.text() || msg);
    } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
export async function createTrip(payload: {
  holderPid: string;
  startDate: string;
  endDate: string;
  destination?: string | null;
  itinerary?: string | null;
  agencyId?: string | null;
  homeCity?: string | null;
  travelerType?: 'indian' | 'international';
}) {
  const res = await fetch(`${BASE}/trips`, {
    method: 'POST',
    headers: await jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return parse(res) as Promise<{
    tid: string;
    status: 'active' | 'scheduled' | 'expired';
    startDate: string;
    endDate: string;
    destination: string | null;
    itinerary: string | null;
    agencyId: string | null;
    homeCity: string | null;
    travelerType: 'indian' | 'international';
    createdAt: string;
  }>;
}

export async function uploadTripDocs(
  tid: string,
  travelerType: 'indian' | 'international',
  files: { passport?: File | null; visa?: File | null; ticket?: File | null; hotel?: File | null; permits?: File | null }
) {
  const fd = new FormData();
  if (travelerType === 'international') {
    if (files.passport) fd.append('passport', files.passport);
    if (files.visa) fd.append('visa', files.visa);
  }
  if (files.ticket) fd.append('ticket', files.ticket);
  if (files.hotel) fd.append('hotel', files.hotel);
  if (travelerType === 'indian' && files.permits) fd.append('permits', files.permits);

  const res = await fetch(`${BASE}/trips/${tid}/docs`, {
    method: 'POST',
    headers: await authHeaders(), // do not set Content-Type for FormData
    body: fd,
  });
  return parse(res) as Promise<{ ok: true; tid: string; travelerType: 'indian' | 'international' }>;
}

export async function getMyTrips() {
  const res = await fetch(`${BASE}/trips`, { headers: await authHeaders() });
  return parse(res) as Promise<{
    trips: Array<{
      tid: string;
      status: 'active' | 'scheduled' | 'expired';
      startDate: string;
      endDate: string;
      destination: string | null;
      itinerary: string | null;
      agencyId: string | null;
      homeCity: string | null;
      travelerType: 'indian' | 'international';
      createdAt: string;
    }>;
  }>;
}

export async function getTrip(tid: string) {
  const res = await fetch(`${BASE}/trips/${tid}`, { headers: await authHeaders() });
  return parse(res) as Promise<{
    tid: string;
    status: 'active' | 'scheduled' | 'expired';
    startDate: string;
    endDate: string;
    destination: string | null;
    itinerary: string | null;
    agencyId: string | null;
    homeCity: string | null;
    travelerType: 'indian' | 'international';
    createdAt: string;
  }>;
}

