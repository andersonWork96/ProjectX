"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "../home/home.module.css";
import { buildBackendUrl } from "../../../lib/constants";
import { toErrorMessage } from "../../../lib/errors";
import type { ReportItem } from "../../../lib/types/report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  importExcel,
  processByInstallation,
  regenerateReport,
} from "./service/report.service";
import { useReport } from "./hooks/use-report";

export default function DashboardReportPage() {
  const {
    user,
    message,
    setMessage,
    items,
    loading,
    setLoading,
    loadItems,
    signOut,
  } = useReport();
  const [darkMode, setDarkMode] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [installationFilter, setInstallationFilter] = useState("");
  const [quickLabelImage, setQuickLabelImage] = useState<File | null>(null);
  const [quickMeterImage, setQuickMeterImage] = useState<File | null>(null);
  const [labelPreviewUrl, setLabelPreviewUrl] = useState<string | null>(null);
  const [meterPreviewUrl, setMeterPreviewUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<ReportItem | null>(null);
  const [draftInstallation, setDraftInstallation] = useState("");
  const [draftCustomer, setDraftCustomer] = useState("");
  const [draftSn, setDraftSn] = useState("");
  const [draftReading, setDraftReading] = useState("");

  const resetQuickProcessFields = () => {
    setInstallationFilter("");
    setQuickLabelImage(null);
    setQuickMeterImage(null);
    if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
    if (meterPreviewUrl) URL.revokeObjectURL(meterPreviewUrl);
    setLabelPreviewUrl(null);
    setMeterPreviewUrl(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem("projectx_dark_mode");
    if (saved === "1") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("projectx_dark_mode", darkMode ? "1" : "0");
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (labelPreviewUrl) URL.revokeObjectURL(labelPreviewUrl);
      if (meterPreviewUrl) URL.revokeObjectURL(meterPreviewUrl);
    };
  }, [labelPreviewUrl, meterPreviewUrl]);

  const handleImportExcel = async () => {
    const selectedExcel = excelFile ?? excelInputRef.current?.files?.[0] ?? null;
    if (!selectedExcel) {
      setMessage("Selecione o arquivo Excel primeiro.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await importExcel(selectedExcel);
      await loadItems();
      setMessage(
        `Importacao concluida. Novos: ${result.importedCount}. Ignorados: ${result.skippedCount}.`
      );
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickProcess = async () => {
    if (!installationFilter.trim()) {
      setMessage("Informe o numero da instalacao.");
      return;
    }
    if (!quickLabelImage || !quickMeterImage) {
      setMessage("Selecione as duas imagens.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const item = await processByInstallation(
        installationFilter.trim(),
        quickLabelImage,
        quickMeterImage
      );
      await loadItems();
      setMessage(`Documento gerado com sucesso para OS ${item.osNumber}.`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openPreviewModal = (row: ReportItem) => {
    setEditingRow(row);
    setDraftInstallation(row.installationCode ?? "");
    setDraftCustomer(row.customerName ?? "");
    setDraftSn(row.snLast6 ?? "");
    setDraftReading(row.meterReading ?? "");
  };

  const closePreviewModal = () => {
    setEditingRow(null);
  };

  const handleRegenerateFromModal = async () => {
    if (!editingRow) return;

    setLoading(true);
    setMessage(null);
    try {
      const updated = await regenerateReport(editingRow.id, {
        installationCode: draftInstallation,
        customerName: draftCustomer,
        snLast6: draftSn,
        meterReading: draftReading,
      });
      await loadItems();
      setEditingRow(updated);
      setDraftInstallation(updated.installationCode ?? "");
      setDraftCustomer(updated.customerName ?? "");
      setDraftSn(updated.snLast6 ?? "");
      setDraftReading(updated.meterReading ?? "");
      setMessage("Documento atualizado e gerado com sucesso.");

      if (updated.documentUrl) {
        window.open(buildBackendUrl(updated.documentUrl), "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasteImage = (
    e: React.ClipboardEvent<HTMLDivElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      const blob = item.getAsFile();
      if (!blob) continue;
      const file = new File([blob], `paste-${Date.now()}.png`, {
        type: blob.type || "image/png",
      });
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setMessage("Imagem colada com sucesso.");
      return;
    }
    setMessage("Nenhuma imagem encontrada no Ctrl+V.");
  };

  const filteredItems = items.filter((x) =>
    installationFilter.trim()
      ? x.installationCode.includes(installationFilter.trim())
      : true
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [installationFilter, pageSize]);

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("processado")) return styles.statusOk;
    if (s.includes("aguardando")) return styles.statusPending;
    return styles.statusWarn;
  };

  return (
    <div className={`${styles.shell} ${darkMode ? styles.darkTheme : ""}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>ProjectX</div>
        <nav className={styles.menu}>
          <Link href="/dashboard/home" className={styles.menuItem}>
            Home
          </Link>
          <Link href="/dashboard/relatorio" className={`${styles.menuItem} ${styles.menuActive}`}>
            Relatorio
          </Link>
        </nav>
        <button type="button" className={styles.signOut} onClick={signOut}>
          Sair
        </button>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <p className={styles.kicker}>Relatorios</p>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => setDarkMode((v) => !v)}
            >
              {darkMode ? "Modo claro" : "Modo escuro"}
            </button>
          </div>
          <h1>Bem-vindo{user?.name ? `, ${user.name}` : ""}. Automacao de Word por OS.</h1>
          <p className={styles.subtitle}>
            Importe o Excel, envie 2 imagens por instalacao e gere os documentos automaticamente.
          </p>
        </header>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>1) Importar planilha</h2>
          <div className={styles.inlineActions}>
            <input
              className={styles.hiddenFileInput}
              ref={excelInputRef}
              type="file"
              id="excel-file"
              accept=".xlsx,.xls"
              onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="excel-file" className={styles.fileTrigger}>
              {excelFile?.name ? `Planilha: ${excelFile.name}` : "Selecionar planilha"}
            </label>
            <button type="button" onClick={handleImportExcel} disabled={loading}>
              {loading ? "Processando..." : "Importar Excel"}
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>2) Processar por instalacao (fluxo rapido)</h2>
          <div className={styles.inlineActions}>
            <input
              className={styles.inputField}
              type="text"
              value={installationFilter}
              onChange={(e) => setInstallationFilter(e.target.value)}
              placeholder="Numero da instalacao"
            />
            <div
              className={styles.pasteZone}
              onPaste={(e) =>
                handlePasteImage(e, setQuickLabelImage, setLabelPreviewUrl)
              }
              tabIndex={0}
            >
              <strong>Imagem 1 (etiqueta)</strong>
              <p>Cole aqui com Ctrl+V</p>
              {labelPreviewUrl && (
                <img src={labelPreviewUrl} alt="Preview etiqueta" className={styles.pastePreview} />
              )}
            </div>
            <div
              className={styles.pasteZone}
              onPaste={(e) =>
                handlePasteImage(e, setQuickMeterImage, setMeterPreviewUrl)
              }
              tabIndex={0}
            >
              <strong>Imagem 2 (medidor)</strong>
              <p>Cole aqui com Ctrl+V</p>
              {meterPreviewUrl && (
                <img src={meterPreviewUrl} alt="Preview medidor" className={styles.pastePreview} />
              )}
            </div>
            <button type="button" onClick={handleQuickProcess} disabled={loading}>
              {loading ? "Processando..." : "Gerar Word automatico"}
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS</TableHead>
                <TableHead>Instalacao</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Obs</TableHead>
                <TableHead>Categorizacao</TableHead>
                <TableHead>Medidor planilha</TableHead>
                <TableHead>Endereco</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>SN(6)</TableHead>
                <TableHead>Leitura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedItems.map((row) => {
                const documentHref = row.documentUrl
                  ? buildBackendUrl(row.documentUrl)
                  : null;

                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.osNumber}</TableCell>
                    <TableCell>{row.installationCode}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.notes || "-"}</TableCell>
                    <TableCell>{row.category || "-"}</TableCell>
                    <TableCell>{row.meterCode}</TableCell>
                    <TableCell>{row.address || "-"}</TableCell>
                    <TableCell>{row.neighborhood || "-"}</TableCell>
                    <TableCell>{row.city || "-"}</TableCell>
                    <TableCell>{row.snLast6 ?? "-"}</TableCell>
                    <TableCell>{row.meterReading ?? "-"}</TableCell>
                    <TableCell>
                      <span className={`${styles.statusChip} ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={styles.docActions}>
                        {documentHref && (
                          <a
                            href={documentHref}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => resetQuickProcessFields()}
                          >
                            Baixar Word
                          </a>
                        )}
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openPreviewModal(row)}
                          title="Pre-visualizar documento"
                          aria-label="Pre-visualizar documento"
                        >
                          <span aria-hidden="true">👁</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className={styles.pagination}>
            <div className={styles.paginationLeft}>
              <label htmlFor="page-size">Itens por pagina</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <span>
                Total: {filteredItems.length} registros
              </span>
            </div>
            <div className={styles.paginationRight}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                Anterior
              </button>
              <span>
                Pagina {safePage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Proxima
              </button>
            </div>
          </div>
        </section>

        {editingRow && (
          <div className={styles.modalOverlay} onClick={closePreviewModal}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Pre-visualizacao do documento - OS {editingRow.osNumber}</h3>
                <button type="button" onClick={closePreviewModal}>
                  Fechar
                </button>
              </div>

              <div className={styles.modalGrid}>
                <label>
                  Codigo de instalacao
                  <input
                    value={draftInstallation}
                    onChange={(e) => setDraftInstallation(e.target.value)}
                  />
                </label>
                <label>
                  Cliente
                  <input value={draftCustomer} onChange={(e) => setDraftCustomer(e.target.value)} />
                </label>
                <label>
                  SN
                  <input value={draftSn} onChange={(e) => setDraftSn(e.target.value)} />
                </label>
                <label>
                  Leitura
                  <input value={draftReading} onChange={(e) => setDraftReading(e.target.value)} />
                </label>
              </div>

              <div className={styles.previewDoc}>
                <p><strong>Codigo de instalacao:</strong> {draftInstallation}</p>
                <p><strong>Cliente:</strong> {draftCustomer}</p>
                <p><strong>SN:</strong> {draftSn}</p>
                <p><strong>Leitura:</strong> {draftReading}</p>
                {editingRow.labelImageUrl && (
                  <img
                    src={buildBackendUrl(editingRow.labelImageUrl)}
                    alt="Etiqueta"
                    className={styles.modalImage}
                  />
                )}
                {editingRow.meterImageUrl && (
                  <img
                    src={buildBackendUrl(editingRow.meterImageUrl)}
                    alt="Medidor"
                    className={styles.modalImage}
                  />
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleRegenerateFromModal} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar e gerar Word"}
                </button>
                {editingRow.documentUrl && (
                  <a
                    href={buildBackendUrl(editingRow.documentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => resetQuickProcessFields()}
                  >
                    Baixar Word atual
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {message && <p className={styles.error}>{message}</p>}
      </main>
    </div>
  );
}
