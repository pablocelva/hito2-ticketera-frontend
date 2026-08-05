import { describe, it, expect } from 'vitest';
import {
  EMPTY_EVENT_FILTER,
  applyEventFilter,
  filterEvents,
  getAvailableCities,
  getAvailableStatuses,
  sortEvents,
} from '../../src/utils/event.filter.utils';
import { EventStatus, type Event } from '../../src/models';

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt-x',
    title: 'Noche Electrónica',
    artist: 'Los Sintetizadores',
    venue: 'La Media Torta',
    city: 'Santiago',
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

describe('event.filter.utils', () => {
  it('getAvailableCities devuelve ciudades únicas, recortadas y ordenadas', () => {
    const events = [
      buildEvent({ city: 'Santiago' }),
      buildEvent({ city: '  Santiago  ' }),
      buildEvent({ city: 'Valparaíso' }),
      buildEvent({ city: '' }),
    ];
    expect(getAvailableCities(events)).toEqual(['Santiago', 'Valparaíso']);
  });

  it('getAvailableStatuses devuelve estados únicos en orden de aparición', () => {
    const events = [
      buildEvent(),
      buildEvent({ status: EventStatus.SCHEDULED }),
      buildEvent(),
    ];
    expect(getAvailableStatuses(events)).toEqual([
      EventStatus.ON_SALE,
      EventStatus.SCHEDULED,
    ]);
  });

  it('filterEvents sin filtros devuelve todos los eventos', () => {
    const events = [buildEvent({ id: 'a' }), buildEvent({ id: 'b' })];
    expect(filterEvents(events, EMPTY_EVENT_FILTER)).toEqual(events);
  });

  it('filterEvents filtra por ciudad (incluyendo sin resultados)', () => {
    const events = [
      buildEvent({ id: 'a', city: 'Santiago' }),
      buildEvent({ id: 'b', city: 'Valparaíso' }),
    ];
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, city: 'Santiago' }).map((e) => e.id)).toEqual(['a']);
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, city: 'Concepción' })).toEqual([]);
  });

  it('filterEvents filtra por estado (incluyendo sin resultados)', () => {
    const events = [
      buildEvent({ id: 'a' }),
      buildEvent({ id: 'b', status: EventStatus.SCHEDULED }),
    ];
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, status: EventStatus.ON_SALE }).map((e) => e.id)).toEqual(['a']);
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, status: EventStatus.SOLD_OUT })).toEqual([]);
  });

  it('filterEvents busca por título o artista sin distinguir mayúsculas', () => {
    const events = [
      buildEvent({ id: 'a', title: 'Noche Electrónica', artist: 'Los Sintetizadores' }),
      buildEvent({ id: 'b', title: 'Jazz en la Catedral', artist: 'Trío Andino' }),
    ];
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, query: 'NOCHE' }).map((e) => e.id)).toEqual(['a']);
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, query: 'trío' }).map((e) => e.id)).toEqual(['b']);
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, query: 'zzz' })).toEqual([]);
  });

  it('filterEvents ignora consultas de solo espacios', () => {
    const events = [buildEvent({ id: 'a' })];
    expect(filterEvents(events, { ...EMPTY_EVENT_FILTER, query: '   ' })).toEqual(events);
  });

  it('filterEvents combina ciudad, estado y búsqueda', () => {
    const events = [
      buildEvent({ id: 'a', title: 'Rock del Desierto', city: 'Santiago', status: EventStatus.SOLD_OUT }),
      buildEvent({ id: 'b', title: 'Rock del Desierto', city: 'Valparaíso', status: EventStatus.SCHEDULED }),
      buildEvent({ id: 'c', title: 'Jazz Suave', city: 'Santiago', status: EventStatus.ON_SALE }),
    ];
    const filter = { query: 'rock', city: 'Santiago', status: EventStatus.SOLD_OUT, sort: 'date' as const };
    expect(filterEvents(events, filter).map((e) => e.id)).toEqual(['a']);
  });

  it('sortEvents por fecha ascendente (default)', () => {
    const a = buildEvent({ id: 'a', date: new Date('2026-09-12') });
    const b = buildEvent({ id: 'b', date: new Date('2026-08-01') });
    const c = buildEvent({ id: 'c', date: new Date('2026-10-20') });
    const list = [a, b, c];
    expect(sortEvents(list, 'date').map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('sortEvents por precio ascendente y descendente', () => {
    const a = buildEvent({ id: 'a', price: 45000 });
    const b = buildEvent({ id: 'b', price: 15000 });
    const c = buildEvent({ id: 'c', price: 30000 });
    const list = [a, b, c];
    expect(sortEvents(list, 'price-asc').map((e) => e.id)).toEqual(['b', 'c', 'a']);
    expect(sortEvents(list, 'price-desc').map((e) => e.id)).toEqual(['a', 'c', 'b']);
  });

  it('sortEvents por nombre A–Z', () => {
    const a = buildEvent({ id: 'a', title: 'Noche Electrónica' });
    const b = buildEvent({ id: 'b', title: 'Jazz en la Catedral' });
    const c = buildEvent({ id: 'c', title: 'Rock del Desierto' });
    const list = [a, b, c];
    expect(sortEvents(list, 'name').map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('sortEvents por disponibilidad descendente sin mutar el arreglo original', () => {
    const a = buildEvent({ id: 'a', capacity: 500, ticketsSold: 190 });
    const b = buildEvent({ id: 'b', capacity: 200, ticketsSold: 50 });
    const c = buildEvent({ id: 'c', capacity: 300, ticketsSold: 0 });
    const list = [a, b, c];
    expect(sortEvents(list, 'availability').map((e) => e.id)).toEqual(['a', 'c', 'b']);
    expect(list.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('applyEventFilter combina filtrado y ordenamiento', () => {
    const events = [
      buildEvent({ id: 'a', title: 'Rock del Desierto', city: 'Santiago', price: 45000 }),
      buildEvent({ id: 'b', title: 'Rock del Desierto', city: 'Santiago', price: 30000 }),
      buildEvent({ id: 'c', title: 'Rock del Desierto', city: 'Valparaíso', price: 10000 }),
    ];
    const result = applyEventFilter(events, { query: 'rock', city: 'Santiago', status: 'all', sort: 'price-asc' });
    expect(result.map((e) => e.id)).toEqual(['b', 'a']);
  });
});
