const base = require("@votewise/config/tailwindcss-preset");
/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [...base.content],
};
