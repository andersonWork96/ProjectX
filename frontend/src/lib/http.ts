export async function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();

  let data: T | string = "" as T | string;
  if (text) {
    try {
      data = JSON.parse(text) as T | string;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Erro na requisicao");
  }

  return data as T;
}
