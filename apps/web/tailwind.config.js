const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette").default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"]
      }
    },
    fontSize: {
      ...require("tailwindcss/defaultTheme").fontSize,
      "3xl": "1.75rem"
    },
    transitionTimingFunction: {
      "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)"
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
    addVariablesForColors
  ]
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

  addBase({
    ":root": newVars
  });
}
