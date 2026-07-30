import type { Config } from 'jest';
import sharedConfig from './jest.shared.ts';

const config: Config = {
  ...sharedConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
  testTimeout: 60000,
  reporters: ['default', ['jest-junit', { outputName: 'junit-integration.xml' }]],
  coverageDirectory: './coverage/integration',
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 45,
      lines: 50,
      statements: 50,
    },
  },
};

export default config;
