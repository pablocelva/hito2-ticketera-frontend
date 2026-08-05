import { describe, it, expect } from 'vitest';
import { formatPrice } from '../../src/utils/currency.utils';

describe('currency.utils', () => {
  it('formatea precios con el formato configurado', () => {
    expect(formatPrice(45000)).toContain('45.000');
  });

  it('maneja valores no finitos o negativos', () => {
    expect(formatPrice(-5)).toBe('$0');
    expect(formatPrice(Number.NaN)).toBe('$0');
  });
});