import { getEnvironment, type EnvironmentName } from './environments';
import { loadEnvironment } from './environment';

export interface FrameworkConfig {
  environment: EnvironmentName;

  appUrl: string;
  apiUrl: string;

  workers?: number;
  retries: number;
  timeout: number;
}

export function loadFrameworkConfig(): FrameworkConfig {
  const environmentConfig = loadEnvironment();

  const environment = environmentConfig.ENVIRONMENT as EnvironmentName;

  const profile = getEnvironment(environment);

  return {
    environment,

    appUrl: profile.appUrl,
    apiUrl: profile.apiUrl,

    workers: environmentConfig.PW_WORKERS,

    retries: environmentConfig.PW_RETRIES ?? 0,

    timeout: environmentConfig.PW_TIMEOUT ?? 30_000,
  };
}
