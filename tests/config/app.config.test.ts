import { describe, it, expect } from 'vitest';
import { APP_CONFIG } from '../../src/config/app.config';

describe('APP_CONFIG', () => {
  it('expone los endpoints y la fuente de respaldo', () => {
    expect(APP_CONFIG.EVENTS_ENDPOINT).toBe('/api/v1/events');
    expect(APP_CONFIG.BOOKINGS_ENDPOINT).toBe('/api/v1/bookings');
    expect(APP_CONFIG.FALLBACK_EVENTS_URL).toBe('./data/events.json');
  });
});