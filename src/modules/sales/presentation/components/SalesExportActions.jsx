import Button from "../../../../shared/components/ui/Button";
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
    <div className="row-actions">
      <Button onClick={handleExcel} disabled={!hasRows}>
        Excel
      </Button>
      <Button variant="secondary" onClick={handlePDF} disabled={!hasRows}>
        PDF
      </Button>
    </div>
  );
}