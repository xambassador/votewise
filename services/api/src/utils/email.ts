// From https://github.com/johno/normalize-email/blob/master/test/test.js

const PLUS_ONLY = /\+.*$/;
const PLUS_AND_DOT = /\.|\+.*$/g;
const normalizeableProviders = {
  "gmail.com": { cut: PLUS_AND_DOT },
  "googlemail.com": {
    cut: PLUS_AND_DOT,
    aliasOf: "gmail.com"
  },
  "hotmail.com": { cut: PLUS_ONLY },
  "live.com": { cut: PLUS_AND_DOT },
  "outlook.com": { cut: PLUS_ONLY }
};

export function normalizeEmail(mail: string) {
  if (typeof mail != "string") {
    throw new TypeError("normalize-email expects a string");
  }

  const email = mail.toLowerCase();
  const emailParts = email.split(/@/);

  if (emailParts.length !== 2) return mail;

  let [username, domain] = emailParts;
  if (!username || !domain) return mail;

  if (Object.prototype.hasOwnProperty.call(normalizeableProviders, domain)) {
    if (
      Object.prototype.hasOwnProperty.call(normalizeableProviders[domain as keyof typeof normalizeableProviders], "cut")
    ) {
      username = username.replace(normalizeableProviders[domain as keyof typeof normalizeableProviders].cut, "");
    }
    if (
      Object.prototype.hasOwnProperty.call(
        normalizeableProviders[domain as keyof typeof normalizeableProviders],
        "aliasOf"
      )
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      domain = normalizeableProviders[domain as keyof typeof normalizeableProviders].aliasOf;
    }
  }

  return username + "@" + domain;
}
