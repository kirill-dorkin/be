/* eslint-disable @typescript-eslint/no-var-requires */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const integrationConfig = {
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).(js|jsx|ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2020',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
}

module.exports = createJestConfig(integrationConfig)