import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF({ title, columns, data }) {
  const doc = new jsPDF();

  doc.text(title, 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.key])),
  });

  doc.save(`${title}.pdf`);
}