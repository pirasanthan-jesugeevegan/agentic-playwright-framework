export type EnvironmentName = 'dev' | 'staging' | 'production';

export interface EnvironmentProfile {
  name: EnvironmentName;
  appUrl: string;
  apiUrl: string;
}

const environments: Record<EnvironmentName, EnvironmentProfile> = {
  dev: {
    name: 'dev',
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    apiUrl: process.env.API_URL ?? 'http://localhost:3000/api',
  },

  staging: {
    name: 'staging',
    appUrl: process.env.APP_URL ?? 'https://staging.example.com',
    apiUrl: process.env.API_URL ?? 'https://staging.example.com/api',
  },

  production: {
    name: 'production',
    appUrl: process.env.APP_URL ?? 'https://example.com',
    apiUrl: process.env.API_URL ?? 'https://example.com/api',
  },
};

export function getEnvironment(
  environment: EnvironmentName,
): EnvironmentProfile {
  return environments[environment];
}
