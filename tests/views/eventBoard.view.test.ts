import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBoardView } from '../../src/views/eventBoard.view';
import { EventStatus, type Event } from '../../src/models';

vi.mock('../../src/components/FeaturedBanner/FeaturedBanner', () => ({
  createFeaturedBannerElement: vi.fn(),
}));
vi.mock('../../src/components/EventCard', () => ({
  createEventCardElement: vi.fn(),
}));
vi.mock('../../src/components/BookingForm', () => ({
  createBookingFormElement: vi.fn(),
}));

import { createFeaturedBannerElement } from '../../src/components/FeaturedBanner/FeaturedBanner';
import { createEventCardElement } from '../../src/components/EventCard';
import { createBookingFormElement } from '../../src/components/BookingForm';

const bannerMock = vi.mocked(createFeaturedBannerElement);
const cardMock = vi.mocked(createEventCardElement);
const formMock = vi.mocked(createBookingFormElement);

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

const featuredEvent = buildEvent({ id: 'evt-f', title: 'Destacado', isFeatured: true });
const normalEvent = buildEvent({ id: 'evt-2', title: 'Normal' });

const IDS = ['contenedor-banner', 'contenedor-cartelera', 'contador-fechas', 'contenedor-reserva'];

function setDom(ids: string[]): void {
  document.body.innerHTML = ids.map((id) => `<div id="${id}"></div>`).join('');
}

function getEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (el === null) throw new Error(`No existe #${id} en el DOM.`);
  return el;
}

function captureClickHandlers(container: HTMLElement): Array<(e: PointerEvent) => void> {
  const handlers: Array<(e: PointerEvent) => void> = [];
  const original = container.addEventListener.bind(container);
  vi.spyOn(container, 'addEventListener').mockImplementation(((
    type: string,
    cb: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (type === 'click' && typeof cb === 'function') {
      handlers.push(cb as (e: PointerEvent) => void);
    }
    return original(type, cb as EventListenerOrEventListenerObject, options);
  }) as typeof container.addEventListener);
  return handlers;
}

describe('EventBoardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bannerMock.mockImplementation(() => {
      const section = document.createElement('section');
      section.className = 'banner';
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Comprar Entradas';
      section.appendChild(button);
      return section;
    });
    cardMock.mockImplementation((event: Event) => {
      const article = document.createElement('article');
      article.className = 'card';
      article.setAttribute('data-id', event.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Comprar Entradas';
      article.appendChild(button);
      return article;
    });
    formMock.mockImplementation(() => {
      const section = document.createElement('section');
      section.className = 'form';
      return section;
    });
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('showLoading pinta skeletons y vacía el formulario', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.showLoading();

    expect(getEl('contador-fechas').textContent).toContain('Cargando fechas...');
    expect(getEl('contenedor-banner').firstElementChild?.classList.contains('animate-pulse')).toBe(true);
    expect(getEl('contenedor-cartelera').children.length).toBe(6);
    expect(getEl('contenedor-reserva').children.length).toBe(0);
  });

  it('showEmpty muestra el estado vacío', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.showEmpty();

    expect(getEl('contador-fechas').textContent).toContain('0 Eventos Confirmados');
    expect(getEl('contenedor-banner').children.length).toBe(0);
    expect(getEl('contenedor-cartelera').textContent).toContain('No hay eventos disponibles');
    expect(getEl('contenedor-reserva').children.length).toBe(0);
  });

  it('showError muestra el mensaje y ejecuta el reintento', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const onRetry = vi.fn();
    view.showError('No pudimos cargar la cartelera.', onRetry);

    const cartelera = getEl('contenedor-cartelera');
    expect(cartelera.textContent).toContain('No pudimos cargar la cartelera.');
    const button = cartelera.querySelector('button') as HTMLButtonElement | null;
    button?.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('showError no pinta botón si no hay reintento', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.showError('msg');
    expect(getEl('contenedor-cartelera').querySelector('button')).toBeNull();
  });

  it('renderEvents pinta contador, banner, grilla y formulario', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.renderEvents([featuredEvent, normalEvent]);

    expect(getEl('contador-fechas').textContent).toContain('2 Eventos Confirmados');
    expect(bannerMock).toHaveBeenCalledWith(featuredEvent);
    expect(cardMock).toHaveBeenCalledTimes(1);
    expect(cardMock).toHaveBeenCalledWith(normalEvent);
    expect(formMock).toHaveBeenCalledWith(featuredEvent);

    const cards = getEl('contenedor-cartelera').querySelectorAll('.card');
    expect(cards.length).toBe(1);
    expect(cards[0].classList.contains('animate-fade-up')).toBe(true);
    expect((cards[0] as HTMLElement).style.animationDelay).toBe('0ms');
  });

  it('renderEvents usa singular con un único evento', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.renderEvents([normalEvent]);

    expect(getEl('contador-fechas').textContent).toContain('1 Evento Confirmado');
    expect(bannerMock).toHaveBeenCalledWith(normalEvent);
    expect(formMock).toHaveBeenCalledWith(normalEvent);
  });

  it('renderEvents maneja una cartelera vacía', () => {
    setDom(IDS);
    const view = new EventBoardView();
    view.renderEvents([]);

    expect(getEl('contador-fechas').textContent).toContain('0 Eventos Confirmados');
    expect(bannerMock).not.toHaveBeenCalled();
    expect(cardMock).not.toHaveBeenCalled();
    expect(formMock).toHaveBeenCalledWith(undefined);
  });

  it('renderEvents avisa si falta #contenedor-cartelera', () => {
    setDom(['contenedor-banner', 'contador-fechas', 'contenedor-reserva']);
    const view = new EventBoardView();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.renderEvents([featuredEvent, normalEvent]);

    expect(errorSpy).toHaveBeenCalled();
    expect(bannerMock).not.toHaveBeenCalled();
  });

  it('renderEvents tolera un banner que falla', () => {
    setDom(IDS);
    const view = new EventBoardView();
    bannerMock.mockImplementationOnce(() => {
      throw new Error('banner boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.renderEvents([featuredEvent, normalEvent]);

    expect(getEl('contenedor-banner').children.length).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('renderEvents tolera tarjetas que fallan individualmente', () => {
    setDom(IDS);
    const view = new EventBoardView();
    cardMock.mockImplementationOnce(() => {
      throw new Error('card boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.renderEvents([featuredEvent, normalEvent]);

    expect(getEl('contenedor-cartelera').children.length).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('renderBookingForm tolera errores al crear el formulario', () => {
    setDom(IDS);
    const view = new EventBoardView();
    formMock.mockImplementationOnce(() => {
      throw new Error('form boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.renderEvents([featuredEvent, normalEvent]);

    expect(getEl('contenedor-reserva').children.length).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('clic en una tarjeta preselecciona el evento y hace scroll', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const cartelera = getEl('contenedor-cartelera');
    const handlers = captureClickHandlers(cartelera);
    view.renderEvents([featuredEvent, normalEvent]);

    expect(handlers.length).toBe(1);
    const button = cartelera.querySelector('.card button') as HTMLElement | null;
    handlers[0]({ target: button } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(2);
    expect(formMock).toHaveBeenLastCalledWith(normalEvent);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('ignora clics en botones deshabilitados', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const cartelera = getEl('contenedor-cartelera');
    const handlers = captureClickHandlers(cartelera);
    view.renderEvents([featuredEvent, normalEvent]);

    const button = cartelera.querySelector('.card button') as HTMLButtonElement | null;
    if (button !== null) button.disabled = true;
    handlers[0]({ target: button } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(1);
  });

  it('ignora clics sin objetivo (target null)', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const cartelera = getEl('contenedor-cartelera');
    const handlers = captureClickHandlers(cartelera);
    view.renderEvents([featuredEvent, normalEvent]);

    handlers[0]({ target: null } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(1);
  });

  it('ignora clics fuera de tarjetas y banner', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const cartelera = getEl('contenedor-cartelera');
    const handlers = captureClickHandlers(cartelera);
    view.renderEvents([featuredEvent, normalEvent]);

    handlers[0]({ target: cartelera } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(1);
  });

  it('clic en el banner preselecciona el evento destacado', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const banner = getEl('contenedor-banner');
    const handlers = captureClickHandlers(banner);
    view.renderEvents([featuredEvent, normalEvent]);

    expect(handlers.length).toBe(1);
    const button = banner.querySelector('button') as HTMLElement | null;
    handlers[0]({ target: button } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(2);
    expect(formMock).toHaveBeenLastCalledWith(featuredEvent);
  });

  it('no selecciona nada desde el banner si no hay destacado', () => {
    setDom(IDS);
    const view = new EventBoardView();
    const banner = getEl('contenedor-banner');
    const handlers = captureClickHandlers(banner);
    view.renderEvents([]);

    const target = document.createElement('button');
    banner.appendChild(target);
    handlers[0]({ target } as unknown as PointerEvent);

    expect(formMock).toHaveBeenCalledTimes(1);
  });

  it('tolera la ausencia de todos los contenedores', () => {
    setDom([]);
    const view = new EventBoardView();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    view.showLoading();
    view.showEmpty();
    view.showError('msg');
    view.renderBookingForm(featuredEvent);
    view.renderEvents([featuredEvent]);

    expect(errorSpy).toHaveBeenCalled();
  });

  it('funciona si solo existe #contenedor-cartelera', () => {
    setDom(['contenedor-cartelera']);
    const view = new EventBoardView();
    view.renderEvents([featuredEvent, normalEvent]);

    expect(getEl('contenedor-cartelera').querySelectorAll('.card').length).toBe(1);
    expect(bannerMock).not.toHaveBeenCalled();
    expect(formMock).not.toHaveBeenCalled();
  });
});
