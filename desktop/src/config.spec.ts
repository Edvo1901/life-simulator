import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { getDesktopConfig } from './config';
import { assertPortAvailable } from './localServers';

describe('desktop local server configuration', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'life-simulator-config-'));
    mkdirSync(join(root, 'frontend'));
    mkdirSync(join(root, 'backend'));
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });
  it('reads custom app ports and allows the desktop frontend origin', () => {
    writeFileSync(join(root, 'frontend/.env.local'), 'PORT=3005\n');
    writeFileSync(join(root, 'backend/.env'), 'API_PORT=4000\n');
    writeFileSync(
      join(root, 'backend/.env.local'),
      'API_PORT=4005\nDB_PASSWORD=synthetic-secret\n',
    );
    const config = getDesktopConfig(root, {});
    expect(config.frontendUrl).toBe('http://127.0.0.1:3005');
    expect(config.backendPort).toBe(4005);
    expect(config.backendEnv.CORS_ORIGINS).toContain('http://127.0.0.1:3005');
    expect(config.frontendEnv.DB_PASSWORD).toBeUndefined();
  });
  it('preserves shell precedence and existing allowed origins', () => {
    writeFileSync(join(root, 'frontend/.env.local'), 'PORT=3005\n');
    const config = getDesktopConfig(root, {
      PORT: '3010',
      API_PORT: '4010',
      CORS_ORIGINS: 'http://localhost:9999',
      DB_PASSWORD: 'synthetic-shell-secret',
      AUTH_BOOTSTRAP_PASSWORD: 'synthetic-bootstrap-secret',
    });
    expect(config.frontendEnv.DB_PASSWORD).toBeUndefined();
    expect(config.frontendEnv.AUTH_BOOTSTRAP_PASSWORD).toBeUndefined();
    expect(config.frontendEnv.NEXT_PUBLIC_API_BASE_URL).toBe(
      'http://127.0.0.1:4010',
    );
    expect(config.frontendPort).toBe(3010);
    expect(config.backendPort).toBe(4010);
    expect(config.backendEnv.CORS_ORIGINS).toContain('http://localhost:9999');
  });
  it.each(['0', '65536', 'abc', '', '3.5'])(
    'rejects invalid PORT %s',
    (value) => {
      expect(() => getDesktopConfig(root, { PORT: value })).toThrow(
        'PORT must be',
      );
    },
  );
  it('rejects colliding frontend/backend ports', () => {
    expect(() => getDesktopConfig(root, { PORT: '4000' })).toThrow(
      'must be different',
    );
  });
  it('reports an occupied port without taking over the existing server', async () => {
    const server = createServer();
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    try {
      const address = server.address();
      if (!address || typeof address === 'string')
        throw new Error('Missing port');
      await expect(assertPortAvailable(address.port)).rejects.toThrow(
        'already in use',
      );
      expect(server.listening).toBe(true);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
