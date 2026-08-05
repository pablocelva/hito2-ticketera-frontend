import { describe, it, expect, vi } from 'vitest';
import {
  createEventToolbarElement,
  updateEventToolbarElement,
} from '../../src/components/EventToolbar/EventToolbar';
import {
  EMPTY_EVENT_FILTER,
  type EventFilter,
} from '../../src/utils/event.filter.utils';
import { EventStatus } from '../../src/models';

function getValue(el: HTMLElement, selector: string): string {
  const control = el.querySelector(selector) as HTMLInputElement | HTMLSelectElement | null;
  return control?.value ?? '';
}

describe('EventToolbar', () => {
  it('renderiza todos los controles con sus opciones', () => {
    const el = createEventToolbarElement({
      cities: ['Santiago', 'Valparaíso'],
      statuses: [EventStatus.ON_SALE, EventStatus.SCHEDULED, EventStatus.SOLD_OUT],
      filter: EMPTY_EVENT_FILTER,
      onChange: vi.fn(),
    });

    expect(el.getAttribute('aria-label')).toBe(
      'Filtros y ordenamiento de la cartelera',
    );
    expect(getValue(el, '#filtro-busqueda')).toBe('');

    const cityValues = Array.from(
      el.querySelectorAll('#filtro-ciudad option'),
    ).map((option) => (option as HTMLOptionElement).value);
    expect(cityValues).toEqual(['all', 'Santiago', 'Valparaíso']);

    const statusValues = Array.from(
      el.querySelectorAll('#filtro-estado option'),
    ).map((option) => (option as HTMLOptionElement).value);
    expect(statusValues).toEqual(['all', 'ON_SALE', 'SCHEDULED', 'SOLD_OUT']);
    expect(el.querySelector('#filtro-estado')?.textContent).toContain('A la venta');
    expect(el.querySelector('#filtro-estado')?.textContent).toContain('Próximamente');
    expect(el.querySelector('#filtro-estado')?.textContent).toContain('Agotado');

    const sortValues = Array.from(
      el.querySelectorAll('#filtro-orden option'),
    ).map((option) => (option as HTMLOptionElement).value);
    expect(sortValues).toEqual(['date', 'price-asc', 'price-desc', 'name', 'availability']);
  });

  it('marca las opciones seleccionadas y el valor de búsqueda según el filtro', () => {
    const filter: EventFilter = {
      query: 'jazz',
      city: 'Santiago',
      status: EventStatus.SOLD_OUT,
      sort: 'name',
    };
    const el = createEventToolbarElement({
      cities: ['Santiago', 'Valparaíso'],
      statuses: [EventStatus.ON_SALE, EventStatus.SOLD_OUT],
      filter,
      onChange: vi.fn(),
    });

    expect(getValue(el, '#filtro-busqueda')).toBe('jazz');
    expect(getValue(el, '#filtro-ciudad')).toBe('Santiago');
    expect(getValue(el, '#filtro-estado')).toBe('SOLD_OUT');
    expect(getValue(el, '#filtro-orden')).toBe('name');
  });

  it('solo ofrece la opción "todos" cuando no hay ciudades ni estados', () => {
    const el = createEventToolbarElement({
      cities: [],
      statuses: [],
      filter: EMPTY_EVENT_FILTER,
      onChange: vi.fn(),
    });
    expect(el.querySelectorAll('#filtro-ciudad option').length).toBe(1);
    expect(el.querySelectorAll('#filtro-estado option').length).toBe(1);
  });

  it('notifica los cambios de búsqueda', () => {
    const onChange = vi.fn();
    const el = createEventToolbarElement({
      cities: [],
      statuses: [],
      filter: EMPTY_EVENT_FILTER,
      onChange,
    });
    const searchInput = el.querySelector('#filtro-busqueda') as HTMLInputElement | null;
    searchInput!.value = 'noche';
    searchInput!.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_EVENT_FILTER, query: 'noche' });
  });

  it('acumula los cambios de ciudad, estado y orden sin sobreescribir', () => {
    const onChange = vi.fn();
    const el = createEventToolbarElement({
      cities: ['Santiago'],
      statuses: [EventStatus.ON_SALE],
      filter: EMPTY_EVENT_FILTER,
      onChange,
    });

    const citySelect = el.querySelector('#filtro-ciudad') as HTMLSelectElement | null;
    citySelect!.value = 'Santiago';
    citySelect!.dispatchEvent(new Event('change', { bubbles: true }));

    const statusSelect = el.querySelector('#filtro-estado') as HTMLSelectElement | null;
    statusSelect!.value = 'ON_SALE';
    statusSelect!.dispatchEvent(new Event('change', { bubbles: true }));

    const sortSelect = el.querySelector('#filtro-orden') as HTMLSelectElement | null;
    sortSelect!.value = 'price-desc';
    sortSelect!.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onChange).toHaveBeenNthCalledWith(1, { ...EMPTY_EVENT_FILTER, city: 'Santiago' });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...EMPTY_EVENT_FILTER,
      city: 'Santiago',
      status: EventStatus.ON_SALE,
    });
    expect(onChange).toHaveBeenNthCalledWith(3, {
      ...EMPTY_EVENT_FILTER,
      city: 'Santiago',
      status: EventStatus.ON_SALE,
      sort: 'price-desc',
    });
  });

  it('mantiene el estado interno tras updateEventToolbarElement', () => {
    const onChange = vi.fn();
    const el = createEventToolbarElement({
      cities: ['Santiago'],
      statuses: [EventStatus.ON_SALE],
      filter: EMPTY_EVENT_FILTER,
      onChange,
    });
    updateEventToolbarElement(el, {
      query: 'jazz',
      city: 'Santiago',
      status: 'all',
      sort: 'date',
    });

    const statusSelect = el.querySelector('#filtro-estado') as HTMLSelectElement | null;
    statusSelect!.value = 'ON_SALE';
    statusSelect!.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith({
      query: 'jazz',
      city: 'Santiago',
      status: EventStatus.ON_SALE,
      sort: 'date',
    });
  });

  it('limpia todos los filtros con el botón Limpiar', () => {
    const onChange = vi.fn();
    const el = createEventToolbarElement({
      cities: [],
      statuses: [],
      filter: { query: 'x', city: 'Santiago', status: EventStatus.ON_SALE, sort: 'name' },
      onChange,
    });
    const clearButton = el.querySelector('#btn-limpiar-filtros') as HTMLButtonElement | null;
    clearButton!.dispatchEvent(new Event('click', { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(EMPTY_EVENT_FILTER);
  });

  it('updateEventToolbarElement sincroniza los controles con el filtro', () => {
    const el = createEventToolbarElement({
      cities: ['Santiago'],
      statuses: [EventStatus.ON_SALE],
      filter: EMPTY_EVENT_FILTER,
      onChange: vi.fn(),
    });
    updateEventToolbarElement(el, {
      query: 'nuevo',
      city: 'Santiago',
      status: EventStatus.ON_SALE,
      sort: 'availability',
    });

    expect(getValue(el, '#filtro-busqueda')).toBe('nuevo');
    expect(getValue(el, '#filtro-ciudad')).toBe('Santiago');
    expect(getValue(el, '#filtro-estado')).toBe('ON_SALE');
    expect(getValue(el, '#filtro-orden')).toBe('availability');
  });

  it('updateEventToolbarElement tolera elementos sin controles', () => {
    const div = document.createElement('div');
    expect(() => updateEventToolbarElement(div, EMPTY_EVENT_FILTER)).not.toThrow();
  });
});
