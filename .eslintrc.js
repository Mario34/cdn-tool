module.exports = {
  extends: ['@mario34/eslint-config-ts'],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
  },
  ignorePatterns: [
    'lib/**',
    '.temp/**',
  ],
}
