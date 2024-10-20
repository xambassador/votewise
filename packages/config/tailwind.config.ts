import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

import svgToDataUri from "mini-svg-data-uri";
import colors from "tailwindcss/colors";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

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
      transparent: "transparent",
      inherit: "inherit"
    },
    extend: {
      height: {
        15: "3.75rem" // 60px
      },
      width: {
        15: "3.75rem" // 60px
      },
      boxShadow: {
        "input-ring": "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), 0 0 0 4px var(--tw-ring-color)",
        "image-card": "0 4px 7px 0px rgba(0, 0, 0, 0.25)"
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
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" }
        },
        rotate: {
          "100%": {
            transform: "rotate(360deg)"
          }
        }
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        rotate: "rotate 0.8s linear infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate"), grid]
} satisfies Config;

function grid({ matchUtilities, theme }: PluginAPI) {
  matchUtilities(
    {
      "bg-grid": (value: unknown) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
        )}")`
      }),
      "bg-grid-small": (value: unknown) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
        )}")`
      }),
      "bg-dot": (value: unknown) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
        )}")`
      })
    },
    { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
  );
}

export default config;
