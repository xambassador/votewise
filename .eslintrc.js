const { join } = require("node:path");

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  globals: {
    // eslint show errors when refrencing NodeJS namespace types because it is global and eslint has no idea about it.
    // https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
    NodeJS: "readonly",
    jest: "readonly"
  },
  settings: {
    next: {
      // https://nextjs.org/docs/app/building-your-application/configuring/eslint#rootdir
      rootDir: ["apps/web/"]
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [
          "./apps/web/tsconfig.json",
          "./services/api/tsconfig.json",
          "./services/upload/tsconfig.json",
          "./packages/prisma/tsconfig.json",
          "./packages/schemas/tsconfig.json",
          "./packages/ui/tsconfig.json",
          "./packages/common/debug/tsconfig.json",
          "./packages/common/env/tsconfig.json",
          "./packages/common/errors/tsconfig.json",
          "./packages/common/log/tsconfig.json",
          "./packages/common/text/tsconfig.json",
          "./packages/common/times/tsconfig.json"
        ]
      }
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:functional/external-typescript-recommended",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  parserOptions: {
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: join(__dirname, "tsconfig.eslint.json")
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
    "consistent-return": "error",
    "dot-notation": "error",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "no-alert": "error",
    "no-console": "error",
    "no-lonely-if": "error",
    "no-unused-vars": "off",
    "spaced-comment": "error",
    "object-shorthand": "error",
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "tailwindcss/no-custom-classname": "off",
    // Since we are using prettier which formats classnames.
    "tailwindcss/classnames-order": "off",
    "@next/next/no-img-element": "error",
    "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off", // We use typescript
    "no-restricted-imports": "off",
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        args: "after-used",
        ignoreRestSiblings: true
      }
    ]
  },
  ignorePatterns: [".eslintrc.js", "node_modules", "dist", "build", "out", "coverage", "public"]
};

module.exports = config;
