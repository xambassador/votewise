// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require("ts-jest");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)", "**/test/**/*.test.ts"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper({ "@/*": ["src/*"] }, { prefix: "<rootDir>/" }),
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  collectCoverage: false,
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  prettierPath: null // https://github.com/jestjs/jest/issues/14305#issuecomment-1627346697
};
