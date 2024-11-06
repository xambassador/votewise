import { textSync } from "figlet";

export function banner() {
  const text = textSync("Votewise", {
    font: "Ghost"
  });
  // eslint-disable-next-line no-console
  console.log(`
    ${text}

    [ created by xambassador ]
    `);
}
