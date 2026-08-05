import { type Booking, BookingStatus, type CreateBookingRequest } from '../models';
import { APP_CONFIG } from '../config/app.config';

function isBookingRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function parseBooking(item: unknown): Booking {
  if (!isBookingRecord(item)) {
    throw new Error('Reserva inválida: se esperaba un objeto.');
  }
  const status =
    typeof item.status === 'string' &&
    Object.values(BookingStatus).includes(item.status as BookingStatus)
      ? (item.status as BookingStatus)
      : BookingStatus.PENDING;

  return {
    id: asString(item.id, 'desconocido'),
    eventId: asString(item.eventId, ''),
    customerName: asString(item.customerName, ''),
    customerEmail: asString(item.customerEmail, ''),
    quantity: asNumber(item.quantity, 0),
    unitPrice: asNumber(item.unitPrice, 0),
    totalPrice: asNumber(item.totalPrice, 0),
    status,
    createdAt:
      typeof item.createdAt === 'string' ? new Date(item.createdAt) : new Date(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createLocalBooking(payload: CreateBookingRequest): Booking {
  return {
    id: `local-${Date.now()}`,
    eventId: payload.eventId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    quantity: payload.quantity,
    unitPrice: payload.unitPrice,
    totalPrice: payload.unitPrice * payload.quantity,
    status: BookingStatus.CONFIRMED,
    createdAt: new Date(),
  };
}

export class BookingService {
  static async createBooking(
    payload: CreateBookingRequest,
    delayMs: number = APP_CONFIG.SIMULATED_NETWORK_DELAY_MS,
  ): Promise<Booking> {
    if (delayMs > 0) {
      await delay(delayMs);
    }
    try {
      const response = await fetch(APP_CONFIG.BOOKINGS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message =
          response.status === 409
            ? 'No hay entradas suficientes para el evento seleccionado.'
            : `Error HTTP al crear la reserva: status ${response.status} (${response.statusText})`;
        throw new Error(message);
      }

      const rawData: unknown = await response.json();
      return parseBooking(rawData);
    } catch (error) {
      // Un TypeError de fetch = fallo de red (servidor apagado) → respaldo local.
      // Los errores de negocio (4xx/5xx) se propagan para mostrarlos en pantalla.
      if (error instanceof TypeError) {
        console.warn(
          '[Ticketera] La API no está disponible. Reserva generada localmente.',
          error,
        );
        return createLocalBooking(payload);
      }
      throw error;
    }
  }
}