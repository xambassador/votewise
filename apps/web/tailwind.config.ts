import type { Config } from "tailwindcss";

import votewiseTheme from "@votewise/config/tailwind.config";

const config = {
  ...votewiseTheme,
  content: [...votewiseTheme.content, "../../packages/ui/**/*.tsx", "../../packages/ui/**/*.ts"]
} satisfies Config;

export default config;
