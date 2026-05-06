import js from '@eslint/js';
import globals from 'globals';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const lowNoiseRules = {
  'no-empty': 'off',
  'no-unused-vars': 'off'
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '**/*.log',
      'backend/private_core/**',
      'frontend/tests/ui-review/**',
      'knowledge/**',
      'faceup/**',
      'faceup-v2/**'
    ]
  },
  {
    files: ['frontend/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2024
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...lowNoiseRules
    }
  },
  {
    files: ['frontend/src/**/*.vue'],
    plugins: {
      vue
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
        defineEmits: 'readonly',
        defineProps: 'readonly'
      }
    },
    processor: vue.processors['.vue'],
    rules: {
      ...js.configs.recommended.rules,
      ...vue.configs['flat/essential'].at(-1).rules,
      ...lowNoiseRules,
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['backend/**/*.js', 'backend/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2024
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...lowNoiseRules
    }
  },
  {
    files: ['backend/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...lowNoiseRules
    }
  }
];
