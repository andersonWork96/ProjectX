import { buildBackendUrl } from "../../../../lib/constants";
import type { ImportExcelResult, ReportItem } from "../../../../lib/types/report";

function parseMaybeJson<T>(text: string): T | string {
  if (!text) return "";
  try {
    return JSON.parse(text) as T;
  } catch {
    return text;
  }
}

export async function listReports(): Promise<ReportItem[]> {
  const res = await fetch(buildBackendUrl("/reports"));
  const text = await res.text();
  const data = parseMaybeJson<ReportItem[]>(text);
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Falha ao listar relatorios.");
  }
  return (typeof data === "string" ? [] : data) as ReportItem[];
}

export async function importExcel(file: File): Promise<ImportExcelResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(buildBackendUrl("/reports/import-excel"), {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  const data = parseMaybeJson<ImportExcelResult>(text);
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Falha ao importar Excel.");
  }
  return data as ImportExcelResult;
}

export async function uploadImages(
  id: string,
  labelImage: File,
  meterImage: File
): Promise<void> {
  const formData = new FormData();
  formData.append("labelImage", labelImage);
  formData.append("meterImage", meterImage);

  const res = await fetch(buildBackendUrl(`/reports/${id}/images`), {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Falha ao enviar imagens.");
  }
}

export async function processReport(id: string): Promise<ReportItem> {
  const res = await fetch(buildBackendUrl(`/reports/${id}/process`), {
    method: "POST",
  });
  const text = await res.text();
  const data = parseMaybeJson<ReportItem>(text);
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Falha ao processar relatorio.");
  }
  return data as ReportItem;
}

export async function processByInstallation(
  installationCode: string,
  labelImage: File,
  meterImage: File
): Promise<ReportItem> {
  const formData = new FormData();
  formData.append("installationCode", installationCode);
  formData.append("labelImage", labelImage);
  formData.append("meterImage", meterImage);

  const res = await fetch(buildBackendUrl("/reports/process-by-installation"), {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  const data = parseMaybeJson<ReportItem>(text);
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Falha ao processar por instalacao.");
  }
  return data as ReportItem;
}

export async function regenerateReport(
  id: string,
  payload: {
    installationCode: string;
    customerName: string;
    snLast6: string;
    meterReading: string;
  }
): Promise<ReportItem> {
  const res = await fetch(buildBackendUrl(`/reports/${id}/regenerate`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = parseMaybeJson<ReportItem>(text);
  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : "Falha ao regenerar documento.");
  }
  return data as ReportItem;
}
