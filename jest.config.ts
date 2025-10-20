export default {
  testEnvironment: 'node',
  preset: 'ts-jest',
  verbose: true,
  coveragePathIgnorePatterns: ['./node_modules/', './dist/', './test'],
  testPathIgnorePatterns: ['./dist', './node_modules'],
  coverageReporters: ['lcov'],
  moduleDirectories: ['./node_modules'],
  reporters: ['default', ['jest-junit', { outputName: 'junit-unit.xml' }]],
  coverageDirectory: './coverage/unit',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(mt|t|cj|j)s$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
