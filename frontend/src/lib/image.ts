const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

export function imgSrc(url: string | null | undefined): string {
  if (!url) return "";
  // Se já é base64 data URI, usar direto
  if (url.startsWith("data:")) return url;
  // Se é URL absoluta, usar direto
  if (url.startsWith("http")) return url;
  // Se é path relativo, prefixar com API_URL
  return `${API_URL}${url}`;
}
