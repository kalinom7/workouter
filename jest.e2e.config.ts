import type { Config } from 'jest';
import sharedConfig from './jest.shared.ts';

const config: Config = {
  ...sharedConfig,
  displayName: 'e2e',
  testMatch: ['<rootDir>/test/e2e/**/*.test.ts'],
  testTimeout: 60000,
  reporters: ['default', ['jest-junit', { outputName: 'junit-e2e.xml' }]],
  coverageDirectory: './coverage/e2e',
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },
};

export default config;
