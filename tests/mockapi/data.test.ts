import { describe, it, expect } from 'vitest';
import { eventsData } from '../../mockapi/data.ts';
import { EventStatus } from '../../src/models/events';

interface MockEventRecord {
  id: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  status: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

const REQUIRED_KEYS = [
  'id',
  'title',
  'artist',
  'venue',
  'city',
  'date',
  'time',
  'price',
  'capacity',
  'ticketsSold',
  'status',
] as const;

describe('MockAPI: fixture de eventos', () => {
  const events = eventsData as MockEventRecord[];

  it('debe exponer 13 eventos', () => {
    expect(events).toHaveLength(13);
  });

  it('cada evento debe cumplir la interfaz Event con los campos requeridos', () => {
    events.forEach((event) => {
      expect(event).not.toBeNull();
      REQUIRED_KEYS.forEach((key) => {
        expect(event).toHaveProperty(key);
      });
    });
  });

  it('cada evento debe tener un id único', () => {
    const ids = events.map((event) => event.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada estado debe ser un valor válido de EventStatus', () => {
    const validStatuses = Object.values(EventStatus);
    events.forEach((event) => {
      expect(validStatuses).toContain(event.status);
    });
  });

  it('los campos numéricos deben ser coherentes', () => {
    events.forEach((event) => {
      expect(event.price).toBeGreaterThan(0);
      expect(event.capacity).toBeGreaterThan(0);
      expect(event.ticketsSold).toBeGreaterThanOrEqual(0);
      expect(event.ticketsSold).toBeLessThanOrEqual(event.capacity);
    });
  });

  it('las fechas deben ser ISO parseables', () => {
    events.forEach((event) => {
      const parsed = new Date(event.date);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
    });
  });

  it('debe haber al menos un evento destacado', () => {
    expect(events.some((event) => event.isFeatured === true)).toBe(true);
  });
});
