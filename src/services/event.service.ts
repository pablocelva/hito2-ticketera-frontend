import { type Event, EventStatus } from '../models';
import { APP_CONFIG } from '../config/app.config';
import { parseEventDate } from '../utils/date.utils';

function isEventRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asEventStatus(value: unknown): EventStatus {
  return typeof value === 'string' &&
    Object.values(EventStatus).includes(value as EventStatus)
    ? (value as EventStatus)
    : EventStatus.SCHEDULED;
}

export function parseEvent(item: unknown): Event {
  if (!isEventRecord(item)) {
    throw new Error('Entrada de evento inválida: se esperaba un objeto.');
  }
  return {
    id: asString(item.id, 'desconocido'),
    title: asString(item.title, 'Evento sin título'),
    artist: asString(item.artist, 'Artista por confirmar'),
    venue: asString(item.venue, 'Sede por confirmar'),
    city: asString(item.city, 'Ciudad por confirmar'),
    date: parseEventDate(item.date),
    time: asString(item.time, 'Por confirmar'),
    price: asNumber(item.price, 0),
    capacity: asNumber(item.capacity, 0),
    ticketsSold: asNumber(item.ticketsSold, 0),
    status: asEventStatus(item.status),
    imageUrl: asString(item.imageUrl, '/images/placeholder.svg'),
    isFeatured: item.isFeatured === true,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class EventService {
  /**
   * Carga la cartelera: intenta la API y, si falla la red o el servidor,
   * cae automáticamente a la cartelera local (public/data/events.json).
   */
  static async getAllEvents(
    delayMs: number = APP_CONFIG.SIMULATED_NETWORK_DELAY_MS,
  ): Promise<Event[]> {
    if (delayMs > 0) {
      await delay(delayMs);
    }
    try {
      return await this.getAllEventsFromApi();
    } catch (apiError) {
      console.warn(
        '[Ticketera] La API no está disponible. Cargando cartelera local de respaldo.',
        apiError,
      );
      return this.getAllEventsFromFallback();
    }
  }

  /** Consume el mock API con validación de canal HTTP. */
  static async getAllEventsFromApi(): Promise<Event[]> {
    const response = await fetch(APP_CONFIG.EVENTS_ENDPOINT);
    if (!response.ok) {
      throw new Error(
        `Error HTTP al obtener los eventos: status ${response.status} (${response.statusText})`,
      );
    }
    const rawData: unknown = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error(
        'La respuesta de eventos no tiene un formato válido (se esperaba un array).',
      );
    }
    return rawData.map((item: unknown) => parseEvent(item));
  }

  /** Fuente de respaldo: JSON estático servido por Vite. */
  static async getAllEventsFromFallback(): Promise<Event[]> {
    const response = await fetch(APP_CONFIG.FALLBACK_EVENTS_URL);
    if (!response.ok) {
      throw new Error(
        `Error HTTP al obtener los eventos de respaldo: status ${response.status}`,
      );
    }
    const rawData: unknown = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error(
        'La respuesta de eventos de respaldo no tiene un formato válido.',
      );
    }
    return rawData.map((item: unknown) => parseEvent(item));
  }

  static getFeaturedEvent(events: Event[]): Event | null {
    if (events.length === 0) return null;
    return events.find((event) => event.isFeatured === true) ?? events[0];
  }

  static getGridEvents(events: Event[]): Event[] {
    if (events.length <= 1) return events;
    return events.filter((event) => event.isFeatured !== true);
  }

  /** Lógica del dominio del Hito 1: capacity - ticketsSold. */
  static getAvailableTickets(event: Event): number {
    return Math.max(0, event.capacity - event.ticketsSold);
  }

  static hasAvailability(event: Event): boolean {
    return this.getAvailableTickets(event) > 0;
  }
}