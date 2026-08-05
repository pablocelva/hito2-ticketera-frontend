import { describe, it, expect, vi, afterEach } from 'vitest';
import { EventService, parseEvent } from '../../src/services/event.service';
import { EventStatus, type Event } from '../../src/models';

const rawEvents = [
  {
    id: '1',
    title: 'Noche Electrónica',
    artist: 'Los Sintetizadores',
    venue: 'La Media Torta',
    city: 'Bogotá',
    date: '2026-09-12T21:00:00',
    time: '21:00',
    price: 45000,
    capacity: 500,
    ticketsSold: 190,
    status: 'ON_SALE',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Jazz Fusión',
    artist: 'Trío Horizontes',
    status: 'DESCONOCIDO',
  },
];

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt-1',
    title: 'Noche Electrónica',
    artist: 'Los Sintetizadores',
    venue: 'La Media Torta',
    city: 'Bogotá',
    date: new Date('2026-09-12T21:00:00'),
    time: '21:00',
    price: 45000,
    capacity: 500,
    ticketsSold: 190,
    status: EventStatus.ON_SALE,
    isFeatured: false,
    ...overrides,
  };
}

describe('EventService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mapear eventos desde la API respetando la interfaz (sin any)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => rawEvents }),
    );

    const events = await EventService.getAllEvents(0);

    expect(events).toHaveLength(2);
    expect(events[0].status).toBe(EventStatus.ON_SALE);
    expect(events[0].isFeatured).toBe(true);
    expect(events[0].date).toBeInstanceOf(Date);
    // Valores por defecto para datos incompletos
    expect(events[1].venue).toBe('Sede por confirmar');
    expect(events[1].status).toBe(EventStatus.SCHEDULED);
  });

  it('debe caer al respaldo estático si la API devuelve un cuerpo inválido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ error: 'x' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => rawEvents }),
    );

    const events = await EventService.getAllEvents(0);

    expect(events).toHaveLength(2);
    expect(events[0].status).toBe(EventStatus.ON_SALE);
  });

  it('debe caer al respaldo estático cuando la API responde 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValueOnce({ ok: true, json: async () => rawEvents }),
    );

    const events = await EventService.getAllEvents(0);
    expect(events.length).toBeGreaterThan(0);
  });

  it('debe caer al respaldo estático cuando la red falla (TypeError)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({ ok: true, json: async () => rawEvents }),
    );

    const events = await EventService.getAllEvents(0);
    expect(events.length).toBeGreaterThan(0);
  });

  it('debe lanzar error si API y respaldo fallan', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' }),
    );

    await expect(EventService.getAllEvents(0)).rejects.toThrow();
  });

  it('parseEvent debe rechazar entradas que no sean objetos', () => {
    expect(() => parseEvent(null)).toThrow('se esperaba un objeto');
  });

  it('debe calcular disponibilidad y featured/grid', () => {
    const ev = buildEvent();
    expect(EventService.getAvailableTickets(ev)).toBe(310);
    expect(EventService.hasAvailability(ev)).toBe(true);
    expect(EventService.getFeaturedEvent([])).toBeNull();
    expect(EventService.getFeaturedEvent([ev])?.id).toBe('evt-1');
    expect(EventService.getGridEvents([ev])).toHaveLength(1);
  });
});