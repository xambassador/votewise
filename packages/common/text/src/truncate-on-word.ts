export function truncateOnWord(text: string, maxLength: number, ellipsis = true) {
  if (text.length <= maxLength) return text;
  let truncatedText = text.substring(0, maxLength);
  truncatedText = truncatedText.substring(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(" ")));
  if (ellipsis) truncatedText += "...";
  return truncatedText;
}

export function obfuscateEmail(email: string) {
  const [username, domain] = email.split("@");
  if (!username || !domain) return email;
  const usernameLength = username.length;

  if (usernameLength <= 2) {
    return `${username[0]}***@${domain}`;
  }

  const threshold = Math.floor(usernameLength / 2);
  const maxLength = 4;
  if (threshold <= maxLength) {
    return `${username.substring(0, threshold)}***@${domain}`;
  }
  return `${username.substring(0, maxLength)}***@${domain}`;
}
