import { describe, it, expect } from 'vitest';
import { filterToQuery, queryToFilter } from '../../src/utils/url.filter.utils';
import { EMPTY_EVENT_FILTER } from '../../src/utils/event.filter.utils';
import { EventStatus } from '../../src/models';

describe('url.filter.utils', () => {
  it('serializa un filtro vacío como cadena vacía', () => {
    expect(filterToQuery(EMPTY_EVENT_FILTER)).toBe('');
  });

  it('serializa un filtro completo', () => {
    const filter = {
      query: 'rock',
      city: 'Santiago',
      status: EventStatus.ON_SALE,
      sort: 'price-asc' as const,
    };
    expect(filterToQuery(filter)).toBe(
      'q=rock&ciudad=Santiago&estado=ON_SALE&orden=price-asc',
    );
  });

  it('codifica los espacios de la búsqueda', () => {
    expect(filterToQuery({ ...EMPTY_EVENT_FILTER, query: 'rock tour' })).toBe(
      'q=rock+tour',
    );
  });

  it('ignora una búsqueda de solo espacios', () => {
    expect(filterToQuery({ ...EMPTY_EVENT_FILTER, query: '   ' })).toBe('');
  });

  it('lee un filtro desde la URL', () => {
    const filter = queryToFilter(
      '?q=rock+tour&ciudad=Santiago&estado=SCHEDULED&orden=name',
    );
    expect(filter).toEqual({
      query: 'rock tour',
      city: 'Santiago',
      status: EventStatus.SCHEDULED,
      sort: 'name',
    });
  });

  it('devuelve el filtro vacío si la URL no aporta nada', () => {
    expect(queryToFilter('')).toEqual(EMPTY_EVENT_FILTER);
  });

  it('descarta estados y ordenamientos inválidos', () => {
    expect(queryToFilter('?estado=RANDOM&orden=raro&q=%20%20')).toEqual(
      EMPTY_EVENT_FILTER,
    );
  });

  it('acepta valores de estado y orden válidos', () => {
    const filter = queryToFilter('?estado=ON_SALE&orden=availability');
    expect(filter.status).toBe(EventStatus.ON_SALE);
    expect(filter.sort).toBe('availability');
  });
});
