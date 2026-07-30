import { type Config } from 'jest';

const sharedConfig: Partial<Config> = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleDirectories: ['./node_modules'],
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
  verbose: true,
  coveragePathIgnorePatterns: ['./node_modules/', './dist/', './test'],
  testPathIgnorePatterns: ['./dist', './node_modules'],
  coverageReporters: ['lcov', 'text-summary'],
};

export default sharedConfig;
