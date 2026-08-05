import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBookingFormElement } from '../../src/components/BookingForm/BookingForm';
import { BookingStatus, EventStatus, type Event, type Booking } from '../../src/models';

vi.mock('../../src/services/booking.service', () => ({
  BookingService: { createBooking: vi.fn() },
}));

import { BookingService } from '../../src/services/booking.service';

const mockedCreateBooking = vi.mocked(BookingService.createBooking);

const mockEvent: Event = {
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
};

function fillInputs(
  el: HTMLElement,
  values: { name?: string; email?: string; quantity?: string },
): void {
  const nameInput = el.querySelector('#txt-nombre') as HTMLInputElement | null;
  const emailInput = el.querySelector('#txt-email') as HTMLInputElement | null;
  const quantityInput = el.querySelector('#txt-cantidad') as HTMLInputElement | null;
  if (nameInput && values.name !== undefined) nameInput.value = values.name;
  if (emailInput && values.email !== undefined) emailInput.value = values.email;
  if (quantityInput && values.quantity !== undefined) quantityInput.value = values.quantity;
}

function submitForm(el: HTMLElement): void {
  const form = el.querySelector('#form-reserva') as HTMLFormElement | null;
  form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

describe('BookingForm Component', () => {
  beforeEach(() => {
    mockedCreateBooking.mockReset();
  });

  it('debe mostrar error de validación cuando el nombre está vacío', () => {
    const el = createBookingFormElement(mockEvent);
    fillInputs(el, { email: 'fan@correo.com', quantity: '2' });
    submitForm(el);

    const errorBlock = el.querySelector('#bloque-error') as HTMLElement | null;
    expect(errorBlock?.classList.contains('hidden')).toBe(false);
    expect(errorBlock?.textContent).toContain('El nombre es requerido.');
  });

  it('debe mostrar error cuando el email es inválido', () => {
    const el = createBookingFormElement(mockEvent);
    fillInputs(el, { name: 'Ana', email: 'correo-invalido', quantity: '2' });
    submitForm(el);

    const errorBlock = el.querySelector('#bloque-error') as HTMLElement | null;
    expect(errorBlock?.textContent).toContain('correo electrónico válido');
  });

  it('debe mostrar error cuando la cantidad está fuera de rango', () => {
    const el = createBookingFormElement(mockEvent);
    fillInputs(el, { name: 'Ana', email: 'fan@correo.com', quantity: '25' });
    submitForm(el);

    const errorBlock = el.querySelector('#bloque-error') as HTMLElement | null;
    expect(errorBlock?.textContent).toContain('entre 1 y 10');
  });

  it('debe inyectar feedback de carga durante el envío y confirmar al finalizar', async () => {
    let resolveBooking: (b: Booking) => void = () => undefined;
    mockedCreateBooking.mockImplementation(
      () =>
        new Promise<Booking>((resolve) => {
          resolveBooking = resolve;
        }),
    );

    const onSuccess = vi.fn();
    const el = createBookingFormElement(mockEvent, onSuccess);
    const button = el.querySelector('#btn-reservar') as HTMLButtonElement | null;

    fillInputs(el, { name: 'Ana', email: 'fan@correo.com', quantity: '2' });
    submitForm(el);

    // Estado de carga (feedback continuo, Pilar 3)
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain('Procesando reserva');

    resolveBooking({
      id: 'bk-1',
      eventId: 'evt-1',
      customerName: 'Ana',
      customerEmail: 'fan@correo.com',
      quantity: 2,
      unitPrice: 45000,
      totalPrice: 90000,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(el.textContent).toContain('¡Reserva Confirmada!');
    expect(el.textContent).toContain('2 entrada(s)');
  });

  it('debe mostrar el error del servidor (409) sin confirmar', async () => {
    mockedCreateBooking.mockRejectedValue(
      new Error('No hay entradas suficientes para el evento seleccionado.'),
    );

    const onSuccess = vi.fn();
    const el = createBookingFormElement(mockEvent, onSuccess);

    fillInputs(el, { name: 'Ana', email: 'fan@correo.com', quantity: '2' });
    submitForm(el);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSuccess).not.toHaveBeenCalled();
    const errorBlock = el.querySelector('#bloque-error') as HTMLElement | null;
    expect(errorBlock?.classList.contains('hidden')).toBe(false);
    expect(errorBlock?.textContent).toContain('No hay entradas suficientes');
  });
});