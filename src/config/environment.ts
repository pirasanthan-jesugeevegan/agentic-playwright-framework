import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

const environmentSchema = z.object({
  ENVIRONMENT: z.enum(['dev', 'staging', 'production']).default('dev'),

  APP_URL: z.string().url(),

  API_URL: z.string().url(),

  AUTH_USERNAME: z.string().optional(),

  AUTH_PASSWORD: z.string().optional(),

  PW_WORKERS: z.coerce.number().int().positive().optional(),

  PW_RETRIES: z.coerce.number().int().min(0).optional(),

  PW_TIMEOUT: z.coerce.number().int().positive().optional(),
});

export type EnvironmentConfig = z.infer<typeof environmentSchema>;

export function loadEnvironment(): EnvironmentConfig {
  loadDotEnv();

  return environmentSchema.parse({
    ENVIRONMENT: process.env.ENVIRONMENT,
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    AUTH_USERNAME: process.env.AUTH_USERNAME,
    AUTH_PASSWORD: process.env.AUTH_PASSWORD,
    PW_WORKERS: process.env.PW_WORKERS,
    PW_RETRIES: process.env.PW_RETRIES,
    PW_TIMEOUT: process.env.PW_TIMEOUT,
  });
}
