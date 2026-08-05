import { describe, it, expect, vi } from 'vitest';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../../src/components/StateViews/StateViews';

describe('StateViews', () => {
  it('createErrorStateElement usa un mensaje por defecto', () => {
    const el = createErrorStateElement();
    expect(el.textContent).toContain('Ocurrió un problema');
    expect(el.querySelector('button')).toBeNull();
  });

  it('createErrorStateElement muestra un mensaje personalizado', () => {
    const el = createErrorStateElement('No pudimos cargar la cartelera.');
    expect(el.textContent).toContain('No pudimos cargar la cartelera.');
  });

  it('createErrorStateElement adjunta el callback de reintento', () => {
    const onRetry = vi.fn();
    const el = createErrorStateElement('msg', onRetry);

    const button = el.querySelector('button') as HTMLButtonElement | null;
    expect(button?.textContent).toBe('Reintentar');
    button?.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('createEmptyStateElement indica que no hay eventos', () => {
    const el = createEmptyStateElement();
    expect(el.textContent).toContain('No hay eventos disponibles');
  });
});
