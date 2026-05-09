import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const lowNoiseRules = {
  'no-empty': 'off',
  'no-unused-vars': 'off'
};

const frontendTypeAwareLowNoiseRules = {
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/no-unnecessary-type-assertion': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/unbound-method': 'off'
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
    files: ['packages/contracts/src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.es2024
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.at(-1).rules,
      ...lowNoiseRules,
      '@typescript-eslint/no-unused-vars': 'off'
    }
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
    files: ['frontend/src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: process.cwd()
      },
      globals: {
        ...globals.browser,
        ...globals.es2024
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.at(-1).rules,
      ...tseslint.configs.recommendedTypeChecked.at(-1).rules,
      ...lowNoiseRules,
      ...frontendTypeAwareLowNoiseRules,
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['frontend/src/**/*.vue'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vue
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
        defineEmits: 'readonly',
        defineProps: 'readonly',
        withDefaults: 'readonly'
      }
    },
    processor: vue.processors['.vue'],
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.at(-1).rules,
      ...tseslint.configs.recommendedTypeChecked.at(-1).rules,
      ...vue.configs['flat/essential'].at(-1).rules,
      ...lowNoiseRules,
      ...frontendTypeAwareLowNoiseRules,
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['backend/src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: process.cwd()
      },
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.at(-1).rules,
      ...tseslint.configs.recommendedTypeChecked.at(-1).rules,
      ...lowNoiseRules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['backend/test/**/*.js'],
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
  },
  {
    files: ['backend/scripts/**/*.cjs'],
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
