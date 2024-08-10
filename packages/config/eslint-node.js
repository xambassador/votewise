/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    jest: true
  },
  globals: {
    // eslint show errors when refrencing NodeJS namespace types because it is global and eslint has no idea about it.
    // https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
    NodeJS: "readonly",
    jest: "readonly"
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json", "./services/*/tsconfig.json"]
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
        moduleDirectory: ["node_modules", "src/", "test/"]
      },
      typescript: {
        alwaysTryTypes: true,
        project: ["apps/*/tsconfig.json", "packages/*/tsconfig.json", "services/*/tsconfig.json"]
      }
    }
  },
  rules: {
    "arrow-body-style": ["error", "as-needed"],
    "no-constant-binary-expression": "error",
    "no-constructor-return": "error",
    "no-new-native-nonconstructor": "error",
    "no-promise-executor-return": "error",
    "no-self-compare": "error",
    "no-template-curly-in-string": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-unused-private-class-members": "error",
    "capitalized-comments": "error",
    "consistent-return": "error",
    "dot-notation": "error",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "no-alert": "error",
    "no-console": "error",
    "no-lonely-if": "error",
    "no-unused-vars": "off",
    "spaced-comment": "error",
    "object-shorthand": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "no-restricted-imports": [
      "error",
      {
        patterns: [".*"]
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        args: "after-used",
        ignoreRestSiblings: true
      }
    ]
  },
  overrides: [
    {
      files: ["**/index.ts"],
      rules: {
        "no-restricted-imports": "off"
      }
    }
  ],
  ignorePatterns: ["**/*.js", "node_modules", "dist", "coverage"]
};
