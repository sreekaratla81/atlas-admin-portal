export function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined) return [];
  return [val];
}
export function safeFind<T>(
  xs: unknown,
  predicate: (x: T, i: number, a: T[]) => boolean
): T | undefined {
  return Array.isArray(xs) ? xs.find(predicate) : undefined;
}
export function safeSome<T>(
  xs: unknown,
  predicate: (x: T, i: number, a: T[]) => boolean
): boolean {
  return Array.isArray(xs) ? xs.some(predicate) : false;
}
export function safeIncludes<T extends string | number>(
  xs: unknown,
  value: T
): boolean {
  return Array.isArray(xs) ? (xs as T[]).includes(value) : false;
}

export function safeMap<T, R>(val: unknown, fn: (x: T, i: number, a: T[]) => R): R[] {
  return Array.isArray(val) ? (val as T[]).map(fn) : [];
}
