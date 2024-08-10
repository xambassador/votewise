import figlet from "figlet";

export function banner() {
  const text = figlet.textSync("Votewise", {
    font: "Ghost"
  });
  // eslint-disable-next-line no-console
  console.log(`
    ${text}

    [ created by xambassador ]
    `);
}
