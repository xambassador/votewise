/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "next",
    "airbnb",
    "airbnb-typescript",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["apps/*/tsconfig.json", "packages/ui/tsconfig.json"],
      },
    },
  },
  rules: {
    "@next/next/no-img-element": "error",
    "@next/next/no-html-link-for-pages": "error",
    "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    ],
    "import/prefer-default-export": "off",
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        labelComponents: ["CustomLabel"],
        labelAttributes: ["label"],
        controlComponents: ["CustomInput"],
        assert: "either",
        depth: 3,
      },
    ],
    "react/function-component-definition": ["off"],
  },
  ignorePatterns: ["**/*.js", "**/*.json", "node_modules", "public", "styles", ".next", "coverage", "dist"],
};
