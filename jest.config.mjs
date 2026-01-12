

/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  setupFiles: ["<rootDir>/src/__test__/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  testTimeout: 800000,
};
