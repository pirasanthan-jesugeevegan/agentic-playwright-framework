import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

import dev from './environments/dev.json';
import production from './environments/production.json';
import staging from './environments/staging.json';

function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

const ENVIRONMENTS = { dev, staging, production } as const;

const environmentConfigSchema = z.object({
  appUrl: z.string().url(),
  apiUrl: z.string().url(),
});

const runtimeSchema = z.object({
  ENV: z.enum(['dev', 'staging', 'production']),
  PW_WORKERS: z.coerce.number().int().positive().optional(),
  PW_RETRIES: z.coerce.number().int().min(0).optional(),
  PW_TIMEOUT: z.coerce.number().int().positive().optional(),
});

export interface FrameworkConfig {
  appUrl: string;
  apiUrl: string;
  workers?: number;
  retries: number;
  timeout: number;
}

/** Loads `.env`, picks the environment named by `ENV`, and returns its config. */
export function loadFrameworkConfig(): FrameworkConfig {
  loadDotEnv();

  const runtime = runtimeSchema.parse({
    ENV: process.env.ENV,
    PW_WORKERS: process.env.PW_WORKERS,
    PW_RETRIES: process.env.PW_RETRIES,
    PW_TIMEOUT: process.env.PW_TIMEOUT,
  });

  const env = environmentConfigSchema.parse(ENVIRONMENTS[runtime.ENV]);

  return {
    appUrl: env.appUrl,
    apiUrl: env.apiUrl,
    workers: runtime.PW_WORKERS,
    retries: runtime.PW_RETRIES ?? 0,
    timeout: runtime.PW_TIMEOUT ?? 30_000,
  };
}
