import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'lucide';
import { renderIcon } from '../../src/utils/icon.utils';

vi.mock('lucide', () => ({ createElement: vi.fn() }));

const mockCreateElement = vi.mocked(createElement);

describe('icon.utils', () => {
  afterEach(() => {
    mockCreateElement.mockReset();
  });

  it('devuelve cadena vacía si no hay icono', () => {
    expect(renderIcon(undefined as never)).toBe('');
    expect(mockCreateElement).not.toHaveBeenCalled();
  });

  it('genera el HTML del icono con las clases extra', () => {
    mockCreateElement.mockReturnValue({
      outerHTML: '<svg data-icon></svg>',
      classList: { add: vi.fn() },
    } as unknown as HTMLElement);

    const out = renderIcon({} as never, 'w-4 h-4');

    expect(out).toBe('<svg data-icon></svg>');
    expect(mockCreateElement).toHaveBeenCalledWith({} as never);
  });

  it('no agrega clases si no se pasan', () => {
    const add = vi.fn();
    mockCreateElement.mockReturnValue({
      outerHTML: '<svg data-icon></svg>',
      classList: { add },
    } as unknown as HTMLElement);

    renderIcon({} as never);

    expect(add).not.toHaveBeenCalled();
  });

  it('devuelve cadena vacía si falla la creación del icono', () => {
    mockCreateElement.mockImplementation(() => {
      throw new Error('boom');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(renderIcon({} as never)).toBe('');
    expect(warnSpy).toHaveBeenCalled();
  });
});
