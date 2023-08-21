/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)", "**/test/**/*.test.ts"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/test/prisma.ts"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/test/(.*)$": "<rootDir>/test/$1",
  },
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    // TODO: Add more files to coverage as we add more tests
    "./src/controllers/auth.ts",
    "./src/controllers/user.ts",
    "./src/controllers/onboarding.ts",
    "./src/middlewares/auth.ts",
    "./src/middlewares/onboarded.ts",
  ],
  collectCoverage: true,
};
