import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],

            ['^react', '^@react', '^next'],

            ['^'],

            ['^@pages'],

            ['^@components'],

            ['^@hooks'],

            ['^@contexts'],

            ['^@utils'],

            ['^@services'],

            ['^@types'],

            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ],
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
]);
