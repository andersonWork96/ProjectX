export async function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T | string) : ("" as T | string);

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Erro na requisicao");
  }

  return data as T;
}
