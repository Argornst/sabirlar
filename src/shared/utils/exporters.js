import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export function exportSalesCsv(rows) {
  if (!rows?.length) return;

  const headers = [
    "Tarih",
    "Müşteri",
    "Ürün",
    "Miktar",
    "Birim",
    "Birim Fiyat",
    "Toplam",
    "Durum",
  ];

  const data = rows.map((sale) => [
    sale.sale_date ?? "",
    sale.customer_name ?? "",
    sale.products?.name ?? "",
    sale.quantity ?? "",
    sale.unit ?? "",
    sale.unit_price ?? "",
    sale.total_amount ?? "",
    sale.status ?? "",
  ]);

  const csvContent = [headers, ...data]
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "sabirlar-satislar.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportSalesExcel(rows) {
  if (!rows?.length) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Satışlar");

  sheet.columns = [
    { header: "Tarih", key: "date", width: 15 },
    { header: "Müşteri", key: "customer", width: 25 },
    { header: "Ürün", key: "product", width: 28 },
    { header: "Miktar", key: "quantity", width: 12 },
    { header: "Birim", key: "unit", width: 10 },
    { header: "Birim Fiyat", key: "price", width: 16 },
    { header: "Toplam", key: "total", width: 16 },
    { header: "Durum", key: "status", width: 16 },
  ];

  rows.forEach((sale) => {
    sheet.addRow({
      date: sale.sale_date ?? "",
      customer: sale.customer_name ?? "",
      product: sale.products?.name ?? "",
      quantity: sale.quantity ?? "",
      unit: sale.unit ?? "",
      price: sale.unit_price ?? "",
      total: sale.total_amount ?? "",
      status: sale.status ?? "",
    });
  });

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "sabirlar-satislar.xlsx");
}

export function exportSalesPdf(rows) {
  if (!rows?.length) return;

  const body = [
    [
      { text: "Tarih", style: "tableHeader" },
      { text: "Müşteri", style: "tableHeader" },
      { text: "Ürün", style: "tableHeader" },
      { text: "Miktar", style: "tableHeader" },
      { text: "Birim", style: "tableHeader" },
      { text: "Toplam", style: "tableHeader" },
      { text: "Durum", style: "tableHeader" },
    ],
    ...rows.map((sale) => [
      sale.sale_date ?? "",
      sale.customer_name ?? "",
      sale.products?.name ?? "",
      String(sale.quantity ?? ""),
      sale.unit ?? "",
      String(sale.total_amount ?? ""),
      sale.status ?? "",
    ]),
  ];

  const docDefinition = {
    pageOrientation: "landscape",
    pageSize: "A4",
    content: [
      {
        text: "Sabirlar Perakende Satışlar",
        style: "title",
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: [70, 130, 150, 55, 50, 70, 80],
          body,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return "#2563eb";
            return rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff";
          },
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
        },
      },
    ],
    styles: {
      title: {
        fontSize: 20,
        bold: true,
        color: "#0f172a",
      },
      tableHeader: {
        color: "#ffffff",
        bold: true,
        fontSize: 11,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  pdfMake.createPdf(docDefinition).download("sabirlar-satislar.pdf");
}