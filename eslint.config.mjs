import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

const xpathLocator = {
  selector:
    "Literal[value=/^xpath=/], CallExpression[callee.property.name='locator'] > Literal:first-child[value=/^[/][/]/]",
  message:
    'XPath locator - use getByRole/getByTestId, or a documented CSS fallback if neither exists on the element.',
};

const pageObjectAssertion = {
  selector:
    "CallExpression[callee.name='expect'], CallExpression[callee.object.name='expect']",
  message:
    "Page objects don't assert - expose the locator/action and let the spec hold the expect().",
};

// A tagged describe is (title, { tag }, callback) - three arguments.
const describeWithoutTag = {
  selector:
    "CallExpression[callee.object.name='test'][callee.property.name='describe'][arguments.length<3]",
  message:
    "test.describe(...) needs a { tag: '@smoke' | '@regression' } options argument.",
};

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.auth/**',
      'coverage/**',
      'dist/**',
      'allure-report/**',
      'allure-results/**',
      '.superpowers/**',
      '.playwright-mcp/**',
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

  // CLAUDE.md coding standards. The same rules .claude/scripts/enforce_constitution.py
  // blocks on an agent's Write/Edit, enforced here so humans and CI get them too.
  // (File-naming rules stay in the hook - ESLint has no file-name check.)
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'no-restricted-syntax': ['error', xpathLocator],
    },
  },

  {
    files: ['src/pages/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', xpathLocator, pageObjectAssertion],
    },
  },

  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      'no-restricted-syntax': ['error', xpathLocator, describeWithoutTag],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message:
                'Import test/expect from src/fixtures/pom/test-options so page-object and API fixtures are injected.',
            },
          ],
        },
      ],
      'playwright/valid-title': [
        'error',
        {
          mustMatch: {
            test: [
              '^(?:[A-Za-z]{2,}-\\d+:\\s*)?Verify that the (user|API)\\b',
              'Test titles must start with "Verify that the user" (or "Verify that the API"), optionally prefixed with the plan case ID, e.g. "TC-08: ".',
            ],
          },
        },
      ],
    },
  },

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
  },

  prettier,
);
