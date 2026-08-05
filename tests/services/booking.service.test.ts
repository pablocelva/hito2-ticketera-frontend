import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  BookingService,
  parseBooking,
} from '../../src/services/booking.service';
import { BookingStatus, type CreateBookingRequest } from '../../src/models';

const payload: CreateBookingRequest = {
  eventId: 'evt-1',
  customerName: 'Ana',
  customerEmail: 'fan@correo.com',
  quantity: 2,
  unitPrice: 45000,
};

describe('BookingService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe crear una reserva confirmada vía POST', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'bk-1',
          eventId: 'evt-1',
          customerName: 'Ana',
          customerEmail: 'fan@correo.com',
          quantity: 2,
          unitPrice: 45000,
          totalPrice: 90000,
          status: 'CONFIRMED',
          createdAt: '2026-08-04T12:00:00Z',
        }),
      }),
    );

    const booking = await BookingService.createBooking(payload, 0);

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(booking.totalPrice).toBe(90000);
  });

  it('debe propagar los errores de negocio del servidor (409)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 409, statusText: 'Conflict' }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No hay entradas suficientes',
    );
  });

  it('debe mostrar un mensaje amigable cuando el backend no está disponible (502)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 502, statusText: 'Bad Gateway' }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'El servicio de reservas no está disponible',
    );
  });

  it('debe mostrar un mensaje amigable para payloads inválidos (400)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({ error: 'Payload de reserva inválido' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'Los datos enviados no son válidos',
    );
  });

  it('debe generar una reserva local de respaldo cuando la red falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    const booking = await BookingService.createBooking(payload, 0);

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(booking.id.startsWith('local-')).toBe(true);
  });

  it('parseBooking debe mapear la respuesta del servidor', () => {
    const booking = parseBooking({
      id: 'bk-2',
      eventId: 'evt-1',
      customerName: 'Luis',
      customerEmail: 'l@x.co',
      quantity: 1,
      unitPrice: 1000,
      totalPrice: 1000,
      status: 'PENDING',
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(booking.status).toBe(BookingStatus.PENDING);
    expect(booking.createdAt).toBeInstanceOf(Date);
  });
});