import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { createRequire } from 'node:module';

interface StartedServer {
  baseUrl: string;
  stop: () => Promise<void>;
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, () => {
      const address = probe.address();
      if (address === null || typeof address !== 'object') {
        probe.close();
        reject(new Error('No se pudo obtener un puerto libre'));
        return;
      }
      const port = address.port;
      probe.close(() => resolve(port));
    });
  });
}

function buildChildEnv(port: number): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { PORT: String(port) };
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('VITEST_') || key === 'NODE_V8_COVERAGE') continue;
    if (value !== undefined) env[key] = value;
  }
  return env;
}

async function startServer(): Promise<StartedServer> {
  const port = await getFreePort();
  const rootDir = process.cwd();
  const mockDir = join(rootDir, 'mockapi');
  const serverTs = join(mockDir, 'server.ts');

  let command: string;
  let args: string[];
  if (existsSync(serverTs)) {
    const requireFromMock = createRequire(join(mockDir, 'virtual.js'));
    command = process.execPath;
    args = [requireFromMock.resolve('tsx/cli'), serverTs];
  } else {
    command = process.execPath;
    args = [join(mockDir, 'server.js')];
  }

  const child: ChildProcess = spawn(command, args, {
    cwd: mockDir,
    env: buildChildEnv(port),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let log = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    log += chunk.toString();
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    log += chunk.toString();
  });

  const baseUrl = `http://127.0.0.1:${port}`;

  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 20000;
    child.on('error', (error: Error) => reject(error));

    const poll = (): void => {
      fetch(`${baseUrl}/api/v1/events`)
        .then((response) => {
          if (response.ok) {
            resolve({
              baseUrl,
              stop: () =>
                new Promise<void>((res) => {
                  child.once('exit', () => res());
                  child.kill();
                  setTimeout(res, 2000).unref();
                }),
            });
            return;
          }
          throw new Error(`status ${response.status}`);
        })
        .catch(() => {
          if (Date.now() > deadline) {
            reject(
              new Error(
                `El servidor mock no respondió a tiempo. Log del proceso:\n${log}`,
              ),
            );
            return;
          }
          setTimeout(poll, 200);
        });
    };
    poll();
  });
}

describe('MockAPI: contrato de endpoints', () => {
  let server: StartedServer | undefined;

  beforeAll(async () => {
    server = await startServer();
  }, 30000);

  afterAll(async () => {
    await server?.stop();
  }, 10000);

  it('GET /api/v1/events devuelve 200 con 13 eventos', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/events`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown[];
    expect(body).toHaveLength(13);
  });

  it('GET /api/v1/events/:id devuelve 200 y el evento pedido', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/events/evt-1`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; artist: string };
    expect(body.id).toBe('evt-1');
    expect(body.artist).toBe('Elena Pinderhughes');
  });

  it('GET /api/v1/events/:id devuelve 404 si el evento no existe', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/events/no-existe`);
    expect(response.status).toBe(404);
  });

  it('GET /api/v1/events-error devuelve 500', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/events-error`);
    expect(response.status).toBe(500);
  });

  it('POST /api/v1/bookings crea una reserva confirmada', async () => {
    const payload = {
      eventId: 'evt-1',
      customerName: 'Ana Pérez',
      customerEmail: 'ana@correo.com',
      quantity: 2,
      unitPrice: 45000,
    };
    const response = await fetch(`${server!.baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      status: string;
      totalPrice: number;
      createdAt: string;
    };
    expect(body.id.startsWith('bk-')).toBe(true);
    expect(body.status).toBe('CONFIRMED');
    expect(body.totalPrice).toBe(90000);
    expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
  });

  it('POST /api/v1/bookings devuelve 400 si el payload es inválido', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: 'evt-1', customerName: 'Ana' }),
    });
    expect(response.status).toBe(400);
  });

  it('POST /api/v1/bookings devuelve 404 si el evento no existe', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'no-existe',
        customerName: 'Ana',
        customerEmail: 'ana@correo.com',
        quantity: 1,
        unitPrice: 100,
      }),
    });
    expect(response.status).toBe(404);
  });

  it('POST /api/v1/bookings devuelve 409 si no hay entradas suficientes', async () => {
    const response = await fetch(`${server!.baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'evt-3',
        customerName: 'Ana',
        customerEmail: 'ana@correo.com',
        quantity: 1,
        unitPrice: 38000,
      }),
    });
    expect(response.status).toBe(409);
  });
});
