export type Cursor = { primary: string | Date; secondary: string };

export function unpack(cursor?: string, error?: Error | (() => Error | void)) {
  if (!cursor) return null;
  const result = cursor.split("__");
  const [primary, secondary, ...rest] = result;
  if (!primary || !secondary || rest.length > 0) {
    throw typeof error === "function" ? error() : (error ?? new Error("Malformed cursor"));
  }
  const date = new Date(parseInt(primary, 10));
  if (isNaN(date.getTime())) {
    throw typeof error === "function" ? error() : (error ?? new Error("Malformed cursor"));
  }
  return { primary: date.toISOString(), secondary };
}

export function pack(cursor: Cursor) {
  const { primary, secondary } = cursor;
  const date = new Date(primary).getTime().toString();
  return `${date}__${secondary}`;
}
