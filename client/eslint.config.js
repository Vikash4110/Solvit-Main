// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // React + JSX rules
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
