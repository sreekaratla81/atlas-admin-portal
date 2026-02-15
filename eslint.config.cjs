/**
 * ESLint 9+ flat config. Uses FlatCompat to apply the legacy .eslintrc.cjs
 * so that "npx eslint ." works once node_modules is installed (npm ci).
 */
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

const legacy = require('./.eslintrc.cjs');

const defaultIgnores = ['dist', 'coverage', 'node_modules', 'public/auth-bypass.json', 'eslint.config.cjs'];
module.exports = [
  { ignores: legacy.ignorePatterns ? [...legacy.ignorePatterns, 'eslint.config.cjs'] : defaultIgnores },
  ...compat.config({
    extends: legacy.extends,
    plugins: legacy.plugins,
    env: legacy.env,
    parser: legacy.parser,
    parserOptions: legacy.parserOptions,
    settings: legacy.settings,
    rules: legacy.rules,
  }),
];
