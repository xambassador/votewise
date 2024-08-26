import type { Config } from "tailwindcss";

import colors from "tailwindcss/colors";

const config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      gray: {
        50: "hsl(var(--gray-50))",
        100: "hsl(var(--gray-100))",
        200: "hsl(var(--gray-200))",
        300: "hsl(var(--gray-300))",
        400: "hsl(var(--gray-400))",
        500: "hsl(var(--gray-500))",
        600: "hsl(var(--gray-600))",
        700: "hsl(var(--gray-700))",
        800: "hsl(var(--gray-800))",
        900: "hsl(var(--gray-900))"
      },
      black: {
        50: "hsl(var(--black-50))",
        100: "hsl(var(--black-100))",
        200: "hsl(var(--black-200))",
        300: "hsl(var(--black-300))",
        400: "hsl(var(--black-400))",
        500: "hsl(var(--black-500))",
        600: "hsl(var(--black-600))",
        700: "hsl(var(--black-700))",
        800: "hsl(var(--black-800))",
        900: "hsl(var(--black-900))"
      },
      nobelBlack: {
        50: "hsl(var(--nobel-black-50))",
        100: "hsl(var(--nobel-black-100))",
        200: "hsl(var(--nobel-black-200))"
      },
      white: {
        50: "hsl(var(--white-50))"
      },
      orange: {
        50: "hsl(var(--orange-50))"
      },
      blue: colors.blue,
      green: colors.green,
      red: colors.red,
      transparent: "transparent"
    },
    extend: {
      height: {
        15: "3.75rem" // 60px
      },
      boxShadow: {
        "input-ring": "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), 0 0 0 4px var(--tw-ring-color)"
      },
      fontSize: {
        "3xl": "2rem",
        "7xl": "4rem",
        "8xl": "4.5rem",
        "9xl": "6rem",
        "10xl": "8rem"
      },
      lineHeight: {
        11: "2.75rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;

export default config;
