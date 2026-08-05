import { describe, it, expect } from 'vitest';
import { parseJsonResponse } from '../../src/utils/http.utils';

describe('http.utils', () => {
  it('parsea una respuesta JSON válida', async () => {
    const response = {
      ok: true,
      json: async () => ({ id: 'evt-1' }),
    } as unknown as Response;

    await expect(parseJsonResponse(response, 'mensaje')).resolves.toEqual({
      id: 'evt-1',
    });
  });

  it('lanza un mensaje amigable si el cuerpo no es JSON válido', async () => {
    const response = {
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    } as unknown as Response;

    await expect(
      parseJsonResponse(response, 'El servidor no respondió con un formato válido.'),
    ).rejects.toThrow('El servidor no respondió con un formato válido.');
  });
});
