import type { Preview } from "@storybook/react";

import "../../web/styles/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      values: [{ name: "Dark", value: "#141415" }],
      default: "Dark"
    }
  },
  initialGlobals: {
    // 👇 Set the initial background color
    backgrounds: { value: "Dark" }
  }
};

export default preview;
