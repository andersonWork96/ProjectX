export type ReportItem = {
  id: string;
  installationCode: string;
  customerName: string;
  notes: string;
  category: string;
  osNumber: string;
  meterCode: string;
  address: string;
  neighborhood: string;
  city: string;
  snLast6: string | null;
  meterReading: string | null;
  status: string;
  labelImageUrl: string | null;
  meterImageUrl: string | null;
  documentUrl: string | null;
  createdAt: string;
};

export type ImportExcelResult = {
  importedCount: number;
  skippedCount: number;
};
