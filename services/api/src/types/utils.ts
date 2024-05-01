export type OR<T> = { success: true; body: T } | { success: false; error: string };
