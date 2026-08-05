import type { Event } from '../models';
import { EventStatus } from '../models';

export type SortCriterion =
  | 'date'
  | 'price-asc'
  | 'price-desc'
  | 'name'
  | 'availability';

export interface EventFilter {
  query: string;
  city: string;
  status: EventStatus | 'all';
  sort: SortCriterion;
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.ON_SALE]: 'A la venta',
  [EventStatus.SCHEDULED]: 'Próximamente',
  [EventStatus.SOLD_OUT]: 'Agotado',
  [EventStatus.LIVE]: 'En vivo',
  [EventStatus.FINISHED]: 'Finalizado',
  [EventStatus.CANCELED]: 'Cancelado',
};

export const SORT_OPTIONS: ReadonlyArray<{ value: SortCriterion; label: string }> = [
  { value: 'date', label: 'Fecha' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre (A–Z)' },
  { value: 'availability', label: 'Más entradas disponibles' },
];

export const EMPTY_EVENT_FILTER: EventFilter = {
  query: '',
  city: 'all',
  status: 'all',
  sort: 'date',
};

export function getAvailableCities(events: Event[]): string[] {
  const cities = new Set<string>();
  events.forEach((event) => {
    const city = event.city.trim();
    if (city !== '') {
      cities.add(city);
    }
  });
  return [...cities].sort((a, b) => a.localeCompare(b, 'es'));
}

export function getAvailableStatuses(events: Event[]): EventStatus[] {
  return [...new Set(events.map((event) => event.status))];
}

export function filterEvents(events: Event[], filter: EventFilter): Event[] {
  const query = filter.query.trim().toLowerCase();
  return events.filter((event) => {
    if (filter.city !== 'all' && event.city.trim() !== filter.city) {
      return false;
    }
    if (filter.status !== 'all' && event.status !== filter.status) {
      return false;
    }
    if (
      query !== '' &&
      !`${event.title} ${event.artist}`.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });
}

export function sortEvents(events: Event[], sort: SortCriterion): Event[] {
  const sorted = [...events];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'es'));
      break;
    case 'availability':
      sorted.sort(
        (a, b) =>
          b.capacity - b.ticketsSold - (a.capacity - a.ticketsSold),
      );
      break;
    default:
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      break;
  }
  return sorted;
}

export function applyEventFilter(
  events: Event[],
  filter: EventFilter,
): Event[] {
  return sortEvents(filterEvents(events, filter), filter.sort);
}
