import { exportToExcel } from "../../../../shared/lib/export/excelExport";
import {
  mapProductsToExport,
  productsExportColumns,
} from "../../application/export/productsExport";

export default function ProductsExportActions({ products = [] }) {
  const hasRows = Array.isArray(products) && products.length > 0;

  function handleExcel() {
    if (!hasRows) return;

    exportToExcel({
      fileName: "products-export",
      columns: productsExportColumns,
      data: mapProductsToExport(products),
    });
  }

  return (
    <div className="products-export-actions products-export-actions--inline">
      <button
        type="button"
        className="sales-toolbar-button sales-toolbar-button--excel"
        onClick={handleExcel}
        disabled={!hasRows}
      >
        <ExcelIcon />
        <span>Excel'e Aktar</span>
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