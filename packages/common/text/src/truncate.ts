export function truncate(text: string, maxLength: number, ellipsis = true) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}${ellipsis ? "..." : ""}`;
}
