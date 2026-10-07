/**
 * Loads local frontend settings before Next.js selects its listening port.
 * Used by dev/start; setup notes are in README.md and docs/Assumptions.md.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const projectDirectory = resolve(import.meta.dirname, '../..');
try {
  process.loadEnvFile(resolve(projectDirectory, '.env.local'));
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}

// Loading programmatically avoids passing an env-file flag to Next's dev worker.
process.argv[1] = resolve(projectDirectory, 'node_modules/next/dist/bin/next');
await import(pathToFileURL(process.argv[1]).href);
