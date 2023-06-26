module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname, // this is the reason this is a .js file
    project: ['./tsconfig.eslint.json'],
  },
  extends: [
    '@rubensworks'
  ],

  // TODO: Remove this once solid-client-authn supports node 18.
  ignorePatterns: ['*QuerySparql-solid-test.ts'],

  rules: {
    // Default
    'unicorn/consistent-destructuring': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-new-array': 'off',

    // TODO: Try to re-enable the following rules in the future
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-string-replace-all': 'off',
    'import/no-commonjs': 'off',
    'import/no-unassigned-import': 'off',
    'import/group-exports': 'off',
    'import/no-dynamic-require': 'off',
    'import/exports-last': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/no-default-export': 'off',
    'import/unambiguous': 'off',
    'import/extensions': 'off',
    'import/first': 'off',
    'import/no-nodejs-modules': 'off',
  },
};