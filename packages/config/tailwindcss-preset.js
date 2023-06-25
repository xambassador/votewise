const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette").default;

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"],
      },
      colors: {
        gray: {
          50: "#F9FAFB", // Background
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        red: {
          50: "#FFF5F5",
          100: "#FFE3E2",
          200: "#FFC9C9",
          300: "#FEA8A8",
          400: "#FF8787",
          500: "#FF6B6B",
          600: "#FA5352",
          700: "#F03E3F",
          800: "#E03130",
          900: "#C92B2B",
        },
        orange: {
          50: "#FFF4E5",
          100: "#FFE8CC",
          200: "#FFD8A8",
          300: "#FFBF78",
          400: "#FFA94E",
          500: "#FF922B",
          600: "#FD7E14",
          700: "#F76706",
          800: "#E8580C",
          900: "#D94810",
        },
        green: {
          50: "#EBFCEE",
          100: "#D2F9D9",
          200: "#B1F2BA",
          300: "#8CE99A",
          400: "#69DB7C",
          500: "#51CF66",
          600: "#40C057",
          700: "#36B24D",
          800: "#2F9E44",
          900: "#2B8A3E",
        },
        blue: {
          50: "#E7F5FF",
          100: "#D0EBFF",
          200: "#A4D8FF",
          300: "#74C0FC",
          400: "#4DABF7",
          500: "#339AF0",
          600: "#238BE6",
          700: "#1C7ED7",
          800: "#1971C2",
          900: "#1763AB",
        },
        darkgray: {
          50: "#101010",
          100: "#1c1c1c",
          200: "#2b2b2b",
          300: "#444444",
          400: "#575757",
          500: "#767676",
          600: "#a5a5a5",
          700: "#d6d6d6",
          800: "#e8e8e8",
          900: "#f3f4f6",
        },
        black: {
          900: "#111727",
        },
      },
      boxShadow: {
        "outline-blue": "0 0 0 3px rgba(51, 154, 240, 0.5)",
        "outline-red": "0 0 0 3px rgba(255, 98, 98, 0.5)",
        "outline-green": "0 0 0 3px rgba(81, 207, 102, 0.5)",
        "outline-orange": "0 0 0 3px rgba(255, 146, 43, 0.5)",
        "auth-form": "0px 2px 6px -1px rgba(0, 0, 0, 0.08)",
        "notification-container":
          "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);",
        dropdown: "0px 4px 12px rgba(0, 0, 0, 0.05), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);",
        modal: "0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.10)",
      },
      width: {
        15: "3.75rem",
      },
    },
    fontSize: {
      ...require("tailwindcss/defaultTheme").fontSize,
      "3xl": "1.75rem",
    },
    transitionTimingFunction: {
      "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("tailwind-scrollbar"),
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

  addBase({
    ":root": newVars,
  });
}
