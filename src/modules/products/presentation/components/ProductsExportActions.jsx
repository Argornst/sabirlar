import Button from "../../../../shared/components/ui/Button";
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
    <div className="row-actions">
      <Button onClick={handleExcel} disabled={!hasRows}>
        Excel Export
      </Button>
    </div>
  );
}