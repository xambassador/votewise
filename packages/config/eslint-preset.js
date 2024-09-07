/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  globals: {
    // eslint show errors when refrencing NodeJS namespace types because it is global and eslint has no idea about it.
    // https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
    NodeJS: "readonly",
    jest: "readonly"
  },
  plugins: ["import", "unused-imports"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json", "./services/*/tsconfig.json"]
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    /** https://github.com/import-js/eslint-import-resolver-typescript#configuration */
    "import/resolver": {
      typescript: {
        // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        alwaysTryTypes: true,
        /* -----------------------------------------------------------------------------------------------
         * Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default
         * use <root>/path/to/folder/tsconfig.json
         * Multiple tsconfigs (Useful for monorepos)
         * use a glob pattern
         * use an array : "project": [ "packages/module-a/tsconfig.json", "packages/module-b/tsconfig.json"],
         * use an array of glob patterns
         * -----------------------------------------------------------------------------------------------*/
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
    "no-restricted-imports": [
      "error",
      {
        patterns: [".*"]
      }
    ]
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:functional/external-typescript-recommended",
        "plugin:import/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript"
      ],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
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
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "separate-type-imports",
            disallowTypeAnnotations: false
          }
        ]
      }
    }
  ],
  ignorePatterns: ["**/*.js", "node_modules", "dist", "coverage", "packages/config"]
};
