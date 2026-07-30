import type { Config } from 'jest';
import sharedConfig from './jest.shared.ts';

const config: Config = {
  ...sharedConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/test/domain/**/*.test.ts'],
  reporters: ['default', ['jest-junit', { outputName: 'junit-unit.xml' }]],
  coverageDirectory: './coverage/unit',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
