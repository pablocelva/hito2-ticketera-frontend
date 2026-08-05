import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isPositiveInteger,
  isWithinRange,
} from '../../src/utils/validation.utils';

describe('validation.utils', () => {
  it('debe aceptar correos válidos y rechazar los inválidos', () => {
    expect(isValidEmail('fan@correo.com')).toBe(true);
    expect(isValidEmail('correo-invalido')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });

  it('debe validar enteros positivos', () => {
    expect(isPositiveInteger('3')).toBe(true);
    expect(isPositiveInteger('0')).toBe(false);
    expect(isPositiveInteger('-1')).toBe(false);
    expect(isPositiveInteger('')).toBe(false);
    expect(isPositiveInteger('2.5')).toBe(false);
    expect(isPositiveInteger('abc')).toBe(false);
  });

  it('debe validar rangos inclusivos', () => {
    expect(isWithinRange(1, 1, 10)).toBe(true);
    expect(isWithinRange(10, 1, 10)).toBe(true);
    expect(isWithinRange(0, 1, 10)).toBe(false);
    expect(isWithinRange(11, 1, 10)).toBe(false);
  });
});