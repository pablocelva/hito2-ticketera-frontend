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

function okResponse(): { ok: true; status: number; json: () => Promise<object> } {
  return {
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
  };
}

describe('BookingService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe crear una reserva confirmada vía POST', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));

    const booking = await BookingService.createBooking(payload, 0);

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(booking.totalPrice).toBe(90000);
  });

  it('debe propagar los errores de negocio del servidor (409)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        text: async () => JSON.stringify({ error: 'No hay entradas suficientes' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No hay entradas suficientes',
    );
  });

  it('debe mostrar un mensaje amigable para eventos inexistentes (404)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ error: 'Evento no encontrado' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'ya no está disponible para reservar',
    );
  });

  it('debe mostrar un mensaje amigable cuando el backend no está disponible (502)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: async () => JSON.stringify({ error: 'Gateway' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'El servicio de reservas no está disponible',
    );
  });

  it.each([503, 504])(
    'debe mostrar un mensaje amigable si el gateway responde %s',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status,
          statusText: 'Gateway',
          text: async () => JSON.stringify({ error: 'Gateway' }),
        }),
      );

      await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
        'El servicio de reservas no está disponible',
      );
    },
  );

  it('debe tratar una respuesta cuyo cuerpo no puede leerse como servicio no disponible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => {
          throw new Error('read failed');
        },
      }),
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

  it('debe mostrar un mensaje amigable para errores 5xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => JSON.stringify({ error: 'Error interno' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'Ocurrió un error en el servidor',
    );
  });

  it('debe usar el mensaje del servidor para estados inesperados', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 418,
        statusText: "I'm a teapot",
        text: async () => JSON.stringify({ error: 'Soy una tetera' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'Soy una tetera',
    );
  });

  it('debe usar un mensaje genérico si el servidor no entrega detalle', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({}),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No fue posible completar la reserva',
    );
  });

  it('debe tratar una respuesta no-JSON (HTML de un host sin API) como servicio no disponible', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => '<html><body>Not Found</body></html>',
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'El servicio de reservas no está disponible',
    );
  });

  it('debe ignorar mensajes de servidor vacíos o sin estructura esperada', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({ error: '' }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No fue posible completar la reserva',
    );
  });

  it('debe ignorar cuerpos de error que no sean objetos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify([1, 2, 3]),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No fue posible completar la reserva',
    );
  });

  it('debe ignorar mensajes de servidor que no sean strings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({ error: 42 }),
      }),
    );

    await expect(BookingService.createBooking(payload, 0)).rejects.toThrow(
      'No fue posible completar la reserva',
    );
  });

  it('debe respetar el delay simulado cuando es mayor a cero', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));

    const booking = await BookingService.createBooking(payload, 1);

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
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

  it('parseBooking debe rechazar valores que no sean objetos', () => {
    expect(() => parseBooking(null)).toThrow('Reserva inválida');
    expect(() => parseBooking([1, 2])).toThrow('Reserva inválida');
    expect(() => parseBooking('texto')).toThrow('Reserva inválida');
  });

  it('parseBooking debe aplicar valores por defecto y normalizar estados', () => {
    const booking = parseBooking({
      id: ' ',
      status: 'RANDOM',
      createdAt: 42,
    });

    expect(booking.id).toBe('desconocido');
    expect(booking.eventId).toBe('');
    expect(booking.customerName).toBe('');
    expect(booking.customerEmail).toBe('');
    expect(booking.quantity).toBe(0);
    expect(booking.unitPrice).toBe(0);
    expect(booking.totalPrice).toBe(0);
    expect(booking.status).toBe(BookingStatus.PENDING);
    expect(booking.createdAt).toBeInstanceOf(Date);
  });
});