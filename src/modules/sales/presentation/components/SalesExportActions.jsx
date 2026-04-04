import { exportToExcel } from "../../../../shared/lib/export/excelExport";
import { exportToPDF } from "../../../../shared/lib/export/pdfExport";
import {
  mapSalesToExport,
  salesExportColumns,
} from "../../application/export/salesExport";

export default function SalesExportActions({ sales = [] }) {
  const hasRows = Array.isArray(sales) && sales.length > 0;

  function handleExcel() {
    if (!hasRows) return;

    exportToExcel({
      fileName: "sales-export",
      columns: salesExportColumns,
      data: mapSalesToExport(sales),
    });
  }

  function handlePDF() {
    if (!hasRows) return;

    exportToPDF({
      title: "Sales Report",
      columns: salesExportColumns,
      data: mapSalesToExport(sales),
    });
  }

  return (
    <div className="sales-export-actions sales-export-actions--inline">
      <button
        type="button"
        className="sales-toolbar-button sales-toolbar-button--excel"
        onClick={handleExcel}
        disabled={!hasRows}
      >
        <ExcelIcon />
        <span>Excel'e Aktar</span>
      </button>

      <button
        type="button"
        className="sales-toolbar-button sales-toolbar-button--pdf"
        onClick={handlePDF}
        disabled={!hasRows}
      >
        <PdfIcon />
        <span>PDF'e Aktar</span>
      </button>
    </div>
  );
}

function ExcelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 3.5H8A2.5 2.5 0 0 0 5.5 6v12A2.5 2.5 0 0 0 8 20.5h8A2.5 2.5 0 0 0 18.5 18V8l-4.5-4.5Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="m8.8 15.2 4.4-6.4" />
      <path d="m8.8 8.8 4.4 6.4" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 3.5H8A2.5 2.5 0 0 0 5.5 6v12A2.5 2.5 0 0 0 8 20.5h8A2.5 2.5 0 0 0 18.5 18V8l-4.5-4.5Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M8.5 15.5h1.2a1.4 1.4 0 0 0 0-2.8H8.5v2.8Z" />
      <path d="M12 15.5v-2.8h1a1.4 1.4 0 1 1 0 2.8h-1Z" />
      <path d="M15.5 15.5v-2.8h2" />
      <path d="M15.5 14.1h1.6" />
    </svg>
  );
}