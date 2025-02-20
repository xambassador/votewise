import type { StorybookConfig } from "@storybook/react-vite";

import { createRequire } from "module";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);

const getAbsolutePath = (value: string) => {
  return dirname(require.resolve(join(value, "package.json")));
};

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../../web/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../web/**/*.stories.mdx",
    "../../../packages/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../packages/ui/**/*.mdx"
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-links")
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {}
  },
  core: {
    builder: "@storybook/builder-vite"
  }
};
export default config;
