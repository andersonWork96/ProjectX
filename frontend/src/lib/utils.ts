export function jsonOrNull<T>(value: T | string): T | null {
  return typeof value === "string" ? null : value;
}
