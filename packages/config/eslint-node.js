/** @type {import("eslint").Linter.Config} */

module.exports = {
  env: {
    node: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/no-var-requires": "off",
    "no-console": "error",
    "no-underscore-dangle": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": ["off"],
    "class-methods-use-this": "off",
    "prettier/prettier": ["warn", { endOfLine: "auto" }],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
        moduleDirectory: ["node_modules", "src/", "test/"],
      },
      typescript: {
        alwaysTryTypes: true,
        // tell where to find tsconfig.json to reolve module alias
        project: "packages/server/tsconfig.json",
      },
    },
  },
  ignorePatterns: ["**/*.js", "node_modules", "dist", "coverage"],
};
