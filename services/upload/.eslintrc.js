/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@votewise/config/eslint-node"),
  parserOptions: {
    root: true,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"]
  },
  rules: {
    "arrow-body-style": "off",
    "capitalized-comments": "off",
    "no-restricted-imports": "off",
    "no-unused-vars": "off"
  }
};
