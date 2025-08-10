// ESLint flat config migrating from .eslintrc for ESLint v9
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import pluginUnused from 'eslint-plugin-unused-imports';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginN from 'eslint-plugin-n';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: process.cwd() });

export default [
  { ignores: ['dist', 'node_modules', 'eslint.config.mjs', '.dependency-cruiser.js', '**/*.js', '**/*.cjs', '**/*.mjs'] },
  // Use compat for pluginImport and pluginN recommended to ensure proper flat plugin shape
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...compat.config(pluginImport.configs.recommended),
  ...compat.config(pluginN.configs['recommended-module']),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: process.cwd(),
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
      'unused-imports': pluginUnused,
      prettier: pluginPrettier,
      n: pluginN
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }
      ],
      '@typescript-eslint/prefer-as-const': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
  'no-var': 'error',
  'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/no-namespace': 'error',
  'import/first': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      'import/no-default-export': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
  // TypeScript compiler handles module resolution; reduce noise after mass renames
  'import/no-unresolved': 'off',
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'no-console': 'off',
      'no-new-wrappers': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration[const=true]',
          message: 'Do not use const enum; use a regular enum instead.'
        },
        {
          selector: 'PropertyDefinition[key.type="PrivateIdentifier"]',
          message: 'Do not use #private fields; use TypeScript private visibility modifier instead.'
        }
      ]
    }
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  {
    files: ['scripts/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  }
];
