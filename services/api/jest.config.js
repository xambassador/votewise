/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)", "**/test/**/*.test.ts"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/test/(.*)$": "<rootDir>/test/$1"
  },
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  collectCoverage: false
};
