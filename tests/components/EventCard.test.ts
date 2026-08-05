import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as EventCardModule from '../../src/components/EventCard/EventCard';
import { EventStatus, type Event } from '../../src/models';

const { generateEventCardHtml, createEventCardElement } = EventCardModule;

const { renderIconMock } = vi.hoisted(() => ({ renderIconMock: vi.fn() }));

vi.mock('../../src/utils/icon.utils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/utils/icon.utils')>();
  renderIconMock.mockImplementation(actual.renderIcon);
  return { ...actual, renderIcon: renderIconMock };
});

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt-1',
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

const statusCases: Array<{
  status: EventStatus;
  label: string;
  buttonText: string;
  disabled: boolean;
}> = [
  { status: EventStatus.ON_SALE, label: 'A LA VENTA', buttonText: 'Comprar Entradas', disabled: false },
  { status: EventStatus.SCHEDULED, label: 'PRÓXIMAMENTE', buttonText: 'Próximamente', disabled: true },
  { status: EventStatus.SOLD_OUT, label: 'AGOTADO', buttonText: 'Agotado', disabled: true },
  { status: EventStatus.LIVE, label: 'EN VIVO', buttonText: 'Ver En Vivo', disabled: true },
  { status: EventStatus.FINISHED, label: 'FINALIZADO', buttonText: 'Finalizado', disabled: true },
  { status: EventStatus.CANCELED, label: 'CANCELADO', buttonText: 'Cancelado', disabled: true },
];

describe('EventCard', () => {
  beforeEach(() => {
    renderIconMock.mockClear();
  });

  it.each(statusCases)('$status renderiza "$label" y botón "$buttonText"', ({ status, label, buttonText, disabled }) => {
    const html = generateEventCardHtml(buildEvent({ status }));
    expect(html).toContain(label);
    expect(html).toContain(buttonText);
    if (disabled) {
      expect(html).toContain('disabled');
    } else {
      expect(html).not.toContain('disabled');
    }
  });

  it('usa el estado POR CONFIRMAR para estados desconocidos', () => {
    const html = generateEventCardHtml(buildEvent({ status: 'UNKNOWN' as EventStatus }));
    expect(html).toContain('POR CONFIRMAR');
    expect(html).toContain('Ver Detalles');
    expect(html).toContain('disabled');
  });

  it('muestra datos del evento: título, artista, fecha, lugar y precio', () => {
    const html = generateEventCardHtml(buildEvent());
    expect(html).toContain('Noche Electrónica');
    expect(html).toContain('Los Sintetizadores');
    expect(html).toContain('La Media Torta');
    expect(html).toContain('Santiago');
    expect(html).toContain('21:00');
    expect(html).toContain('Quedan 310 entradas');
    expect(html).toContain('data-id="evt-1"');
  });

  it('indica la última entrada cuando solo queda una', () => {
    const html = generateEventCardHtml(
      buildEvent({ capacity: 191, ticketsSold: 190 }),
    );
    expect(html).toContain('¡Última entrada!');
  });

  it('no muestra disponibilidad si el evento no está a la venta', () => {
    const html = generateEventCardHtml(buildEvent({ status: EventStatus.SCHEDULED }));
    expect(html).not.toContain('Quedan');
  });

  it('usa una imagen por defecto si el evento no trae imageUrl', () => {
    const html = generateEventCardHtml(buildEvent({ imageUrl: undefined }));
    expect(html).toContain('/images/placeholder.svg');
  });

  it('retorna HTML de respaldo si el evento no existe', () => {
    const html = generateEventCardHtml(null as unknown as Event);
    expect(html).toContain('Información del evento no disponible');
  });

  it('createEventCardElement devuelve un <article> con data-id', () => {
    const el = createEventCardElement(buildEvent());
    expect(el.tagName).toBe('ARTICLE');
    expect(el.getAttribute('data-id')).toBe('evt-1');
    expect(el.textContent).toContain('Comprar Entradas');
  });

  it('createEventCardElement devuelve una tarjeta de error si el render falla', () => {
    renderIconMock.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const el = createEventCardElement(buildEvent());

    expect(el.tagName).toBe('ARTICLE');
    expect(el.textContent).toContain('No se pudo cargar este evento.');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
