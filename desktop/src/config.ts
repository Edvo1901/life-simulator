import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import type { DesktopConfig } from './types/common/desktop';

function readLocalEnv(filename: string): NodeJS.ProcessEnv {
  try {
    return parseEnv(readFileSync(filename, 'utf8'));
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    )
      return {};
    throw new Error('Could not read local application settings.');
  }
}
function parsePort(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const text = value ?? String(fallback);
  const port = Number(text);
  if (
    !/^\d+$/.test(text) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(`${name} must be an integer from 1 to 65535.`);
  }
  return port;
}

/** Read only local settings; keep backend values out of the renderer environment. */
export function getDesktopConfig(
  root: string,
  environment: NodeJS.ProcessEnv = process.env,
): DesktopConfig {
  const frontendDirectory = resolve(root, 'frontend');
  const backendDirectory = resolve(root, 'backend');
  const frontendLocal = readLocalEnv(resolve(frontendDirectory, '.env.local'));
  const backendLocal = {
    ...readLocalEnv(resolve(backendDirectory, '.env')),
    ...readLocalEnv(resolve(backendDirectory, '.env.local')),
  };
  const frontendPort = parsePort(
    environment.PORT ?? frontendLocal.PORT,
    3000,
    'PORT',
  );
  const backendPort = parsePort(
    environment.API_PORT ?? backendLocal.API_PORT,
    4000,
    'API_PORT',
  );
  if (frontendPort === backendPort)
    throw new Error('Frontend PORT and backend API_PORT must be different.');
  const frontendUrl = `http://127.0.0.1:${frontendPort}`;
  const backendEnv = { ...environment, ...backendLocal };
  // Shell values have the same precedence as the existing Node env-file loaders.
  for (const [key, value] of Object.entries(environment))
    if (value !== undefined) backendEnv[key] = value;
  const allowedOrigins = new Set(
    (backendEnv.CORS_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  allowedOrigins.add(frontendUrl);
  allowedOrigins.add(`http://localhost:${frontendPort}`);
  backendEnv.API_PORT = String(backendPort);
  backendEnv.CORS_ORIGINS = [...allowedOrigins].join(',');
  const frontendEnv = {
    ...environment,
    PORT: String(frontendPort),
    NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:' + backendPort,
    NEXT_PUBLIC_API_PREFIX: backendEnv.API_PREFIX ?? 'api',
  };
  for (const key of Object.keys(frontendEnv))
    if (/^(DB_|AUTH_)/.test(key))
      delete (frontendEnv as NodeJS.ProcessEnv)[key];
  return {
    frontendDirectory,
    backendDirectory,
    frontendPort,
    backendPort,
    frontendUrl,
    frontendEnv,
    backendEnv,
  };
}
