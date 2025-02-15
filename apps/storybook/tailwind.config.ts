import type { Config } from "tailwindcss";

import votewiseTheme from "@votewise/config/tailwind.config";

const config = {
  ...votewiseTheme,
  content: [
    ...votewiseTheme.content,
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../web/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/**/*.{js,jsx,ts,tsx}"
  ]
} satisfies Config;

export default config;
