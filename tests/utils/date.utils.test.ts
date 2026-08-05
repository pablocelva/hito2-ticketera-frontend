import { describe, it, expect } from 'vitest';
import { formatDate, parseEventDate } from '../../src/utils/date.utils';

describe('date.utils', () => {
  it('formatea fechas válidas en español', () => {
    expect(formatDate(new Date('2026-09-12T21:00:00'))).toContain('12 de septiembre');
  });

  it('devuelve texto por defecto para fechas inválidas', () => {
    expect(formatDate(undefined)).toBe('Fecha por confirmar');
    expect(formatDate(new Date('fecha-invalida'))).toBe('Fecha por confirmar');
  });

  it('parsea fechas ISO y DD-MM-YYYY', () => {
    const iso = parseEventDate('2026-09-12T21:00:00');
    expect(iso.getFullYear()).toBe(2026);

    const dd = parseEventDate('12-09-2026');
    expect(dd.getDate()).toBe(12);
    expect(dd.getMonth()).toBe(8);
  });

  it('retorna una fecha de respaldo ante un valor inválido', () => {
    expect(parseEventDate('no-es-fecha')).toBeInstanceOf(Date);
  });
});