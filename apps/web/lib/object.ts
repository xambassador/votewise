export function isObjectDirty<T extends object>(source: T, target: T): boolean {
  if (source === target) return false;

  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);

  if (sourceKeys.length !== targetKeys.length) return true;

  for (const key of sourceKeys) {
    if (!targetKeys.includes(key)) return true;
    if (source[key as keyof typeof source] !== target[key as keyof typeof target]) return true;
  }

  return false;
}
