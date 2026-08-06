import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { eventsData } from '../../mockapi/data.ts';

interface MockEventRecord {
  id: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  time: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  status: string;
}

const STABLE_KEYS = [
  'id',
  'title',
  'artist',
  'venue',
  'city',
  'time',
  'price',
  'capacity',
  'ticketsSold',
  'status',
] as const;

describe('Coherencia mockapi ↔ fallback JSON', () => {
  const rootDir = process.cwd();
  const fallbackRaw = readFileSync(
    join(rootDir, 'public', 'data', 'events.json'),
    'utf8',
  );
  const fallbackEvents = JSON.parse(fallbackRaw) as MockEventRecord[];
  const mockEvents = eventsData as MockEventRecord[];

  it('deben existir los mismos eventos (mismos ids)', () => {
    const mockIds = mockEvents.map((event) => event.id).sort();
    const fallbackIds = fallbackEvents.map((event) => event.id).sort();
    expect(mockIds).toEqual(fallbackIds);
  });

  it('cada evento debe coincidir en los campos estables', () => {
    expect(mockEvents).not.toHaveLength(0);
    mockEvents.forEach((mockEvent) => {
      const fallbackEvent = fallbackEvents.find(
        (fallback) => fallback.id === mockEvent.id,
      );
      expect(fallbackEvent).toBeDefined();
      STABLE_KEYS.forEach((key) => {
        expect(fallbackEvent?.[key]).toBe(mockEvent[key]);
      });
    });
  });
});
