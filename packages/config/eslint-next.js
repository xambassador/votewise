/**
 * This is the ESLint configuration for Next.js repos.
 * This is the root configuration file and must imported in root .eslintrc.js file.
 * If in any workspace package that needs it's own ESLint configuration, create a .eslintrc.js file
 * in the package and eslint will automatically use it.
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
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
    "prettier"
  ],
  // https://typescript-eslint.io/getting-started#step-2-configuration
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unused-imports", "eslint-plugin-react"],
  parserOptions: {
    project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
    tsconfigRootDir: __dirname
  },
  settings: {
    next: {
      // https://nextjs.org/docs/app/building-your-application/configuring/eslint#rootdir
      rootDir: ["apps/web/"]
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    // https://github.com/import-js/eslint-import-resolver-typescript#configuration
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["apps/*/tsconfig.json", "packages/*/tsconfig.json"]
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
    "tailwindcss/no-custom-classname": "off",
    // Since we are using prettier which formats classnames.
    "tailwindcss/classnames-order": "off",
    "@next/next/no-img-element": "error",
    "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off", // We use typescript
    "no-restricted-imports": "off",
    "@next/next/no-html-link-for-pages": "off"
  },
  overrides: [
    {
      files: ["**/index.ts"],
      rules: {
        "no-restricted-imports": "off"
      }
    }
  ],
  ignorePatterns: ["**/*.js", "**/*.mjs", "**/*.json", "node_modules", "public", "styles", ".next", "coverage", "dist"]
};
