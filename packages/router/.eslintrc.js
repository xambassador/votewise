/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@votewise/config/eslint-next"),
  parserOptions: {
    root: true,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
