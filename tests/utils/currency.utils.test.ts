import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatPrice } from '../../src/utils/currency.utils';

describe('currency.utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formatea precios con el formato configurado', () => {
    expect(formatPrice(45000)).toContain('45.000');
  });

  it('maneja valores no finitos o negativos', () => {
    expect(formatPrice(-5)).toBe('$0');
    expect(formatPrice(Number.NaN)).toBe('$0');
  });

  it('devuelve el valor plano si el formateo falla', () => {
    vi.spyOn(Intl, 'NumberFormat').mockImplementationOnce(
      (() => {
        throw new Error('locale no soportado');
      }) as unknown as typeof Intl.NumberFormat,
    );
    expect(formatPrice(45000)).toBe('$45000');
  });
});