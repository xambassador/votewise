import type { Config } from "tailwindcss";

import votewiseTheme from "@votewise/config/tailwind.config";

const config = {
  ...votewiseTheme,
  content: [
    ...votewiseTheme.content,
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../web/app/**/*.{js,jsx,ts,tsx}",
    "../web/components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}"
  ]
} satisfies Config;

export default config;
