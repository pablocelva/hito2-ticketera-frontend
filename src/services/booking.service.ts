import { type Booking, BookingStatus, type CreateBookingRequest } from '../models';
import { APP_CONFIG } from '../config/app.config';
import { parseJsonResponse } from '../utils/http.utils';

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

async function readServerMessage(response: Response): Promise<string | undefined> {
  try {
    const raw = await response.text();
    const data = JSON.parse(raw) as unknown;
    if (
      isBookingRecord(data) &&
      typeof data.error === 'string' &&
      data.error.trim() !== ''
    ) {
      return data.error.trim();
    }
  } catch {
    // cuerpo ilegible (no JSON) → sin mensaje del servidor
  }
  return undefined;
}

function buildBookingErrorMessage(
  status: number,
  serverMessage: string | undefined,
): string {
  if (status === 400) {
    return 'Los datos enviados no son válidos. Revisa la información e inténtalo nuevamente.';
  }
  if (status === 404) {
    return 'El evento seleccionado ya no está disponible para reservar.';
  }
  if (status === 409) {
    return 'No hay entradas suficientes para el evento seleccionado.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'El servicio de reservas no está disponible en este momento. Inténtalo nuevamente.';
  }
  if (status >= 500) {
    return 'Ocurrió un error en el servidor al procesar la reserva. Inténtalo nuevamente.';
  }
  return serverMessage ?? 'No fue posible completar la reserva. Inténtalo nuevamente.';
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
        const serverMessage = await readServerMessage(response);
        throw new Error(
          buildBookingErrorMessage(response.status, serverMessage),
        );
      }

      const rawData: unknown = await parseJsonResponse(
        response,
        'El servidor no respondió con un formato válido.',
      );
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