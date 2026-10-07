import type { NextConfig } from 'next';
import { resolve } from 'node:path';
const root = resolve(process.cwd(), '..');
const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  turbopack: { root },
  outputFileTracingRoot: root,
  outputFileTracingIncludes: { '/*': ['../language/**/*.json'] },
};
export default nextConfig;
