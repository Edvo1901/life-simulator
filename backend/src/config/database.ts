import type { DataSourceOptions } from 'typeorm';
export function databaseOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  for (const name of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'])
    if (!env[name]) throw new Error('Required database settings are missing.');
  const port = Number(env.DB_PORT ?? 1433);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid database port.');
  return {
    type: 'mssql',
    host: env.DB_HOST,
    port,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    connectionTimeout: 5000,
    requestTimeout: 10000,
    options: {
      useUTC: false,
      encrypt: env.DB_ENCRYPT === 'true',
      trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    },
  };
}
