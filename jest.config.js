
const DOMAIN = 'workouttemplate';

export default {
  testEnvironment: 'node',

  
  testMatch: [`<rootDir>/src/test/domain/${DOMAIN}/**/*.test.js`],

 
  moduleNameMapper: {
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
  },
};
