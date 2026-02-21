export const AUTH_SERVER_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5010";

export function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${AUTH_SERVER_URL.replace(/\/$/, "")}${normalizedPath}`;
}
