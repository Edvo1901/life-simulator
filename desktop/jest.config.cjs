module.exports = {
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  testEnvironment: 'node',
  transform: {
    '^.+\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
};
