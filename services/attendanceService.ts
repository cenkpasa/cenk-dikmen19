import { api } from './apiService';
import { LocationPing, DayEdge } from '@/types';

export async function fetchLocationPings(start: string, end: string): Promise<LocationPing[]> {
    // This would fetch from a real backend.
    // const { data } = await api.get('/location/pings', { params: { start, end } });
    // return data;

    // Simulating for now
    console.log(`Simulating fetch for location pings between ${start} and ${end}`);
    await new Promise(res => setTimeout(res, 500));
    const MOCK_PINGS: LocationPing[] = [
        { userId: 'user-goksel', ts: `${start}T08:35:00.000Z`, lat: 39.9, lon: 32.8 },
        { userId: 'user-goksel', ts: `${start}T17:55:00.000Z`, lat: 39.9, lon: 32.8 },
        { userId: 'user-ilker', ts: `${start}T09:00:00.000Z`, lat: 39.9, lon: 32.8 },
        { userId: 'user-ilker', ts: `${start}T18:05:00.000Z`, lat: 39.9, lon: 32.8 },
    ];
    return MOCK_PINGS;
}

export function edgesByDay(pings: LocationPing[]): DayEdge[] {
    const by = new Map<string, { first?: string; last?: string }>();
    for (const p of pings) {
        const d = p.ts.slice(0, 10); // YYYY-MM-DD
        const key = `${p.userId}::${d}`;
        const e = by.get(key) || {};
        if (!e.first || p.ts < e.first) e.first = p.ts;
        if (!e.last || p.ts > e.last) e.last = p.ts;
        by.set(key, e);
    }
    return [...by.entries()].map(([k, v]) => {
        const [userId, date] = k.split('::');
        return { userId, date, first: v.first!, last: v.last! };
    });
}
