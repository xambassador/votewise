module.exports = {
  bracketSpacing: true,
  bracketSameLine: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "es5",
  semi: true,
  printWidth: 110,
  arrowParens: "always",
  endOfLine: "auto",
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@(votewise|ee)/(.*)$",
    "^@components/(.*)$",
    "^@lib/(.*)$",
    // "^~/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [require("./merged-prettier-config")],
  overrides: [
    {
      files: "**/server/**/*.{ts,json,js}",
      options: {
        plugins: ["@trivago/prettier-plugin-sort-imports"],
        importOrder: [
          "^dotenv$",
          "^dotenv/config$",
          "^@(votewise|ee)/(.*)$",
          "@/src/(.*)$",
          "@/test/(.*)$",
          "^~/(.*)$",
          "^[./]",
        ],
      },
    },
  ],
};
