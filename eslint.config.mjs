import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.auth/**',
      'coverage/**',
      'dist/**',
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },

  prettier,
);
