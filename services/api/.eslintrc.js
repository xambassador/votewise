/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@votewise/config/eslint-node"),
  parserOptions: {
    root: true,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    ...require("@votewise/config/eslint-node").rules,
    "arrow-body-style": "off",
  },
};
