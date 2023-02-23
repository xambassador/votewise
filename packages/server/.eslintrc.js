/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@votewise/config/eslint-node"),
  parserOptions: {
    root: true,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
