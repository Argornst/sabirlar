function getPageSizeRule(orientation) {
  return orientation === "portrait" ? "A4 portrait" : "A4 landscape";
}

function getPrintWindowCss(orientation = "landscape") {
  const pageSize = getPageSizeRule(orientation);

  return `
    html, body {
      margin: 0;
      padding: 0;
      background: #eef2f7;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
    }

    * {
      box-sizing: border-box;
    }

    .print-window-root {
      padding: 16px;
    }

    .print-document {
      width: 100%;
      max-width: ${orientation === "portrait" ? "900px" : "1200px"};
      margin: 0 auto;
      background: #ffffff;
      color: #0f172a;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
    }

    .print-doc-brandbar {
      height: 6px;
      background: linear-gradient(90deg, #312e81, #2563eb 55%, #06b6d4);
    }

    .print-header--premium {
      padding: 12px 16px 10px;
      display: grid;
      gap: 8px;
      background:
        radial-gradient(circle at top right, rgba(34, 211, 238, 0.10), transparent 28%),
        linear-gradient(180deg, #ffffff, #f8fbff);
      border-bottom: 1px solid #dbeafe;
    }

    .print-header__topline {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
    }

    .print-header__logo {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .print-header__logo-image {
      width: 42px;
      height: 42px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .print-header__logo-text {
      display: grid;
      gap: 1px;
    }

    .print-header__logo-text strong {
      color: #0f172a;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.08em;
      line-height: 1.1;
    }

    .print-header__logo-text span {
      color: #64748b;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1.1;
    }

    .print-header__meta-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
      flex-wrap: wrap;
      color: #334155;
      font-size: 8px;
      font-weight: 700;
      text-align: right;
    }

    .print-weeks {
      padding: 10px 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .print-week-section {
      border: 1px solid #dbe4f0;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-week-accent {
      height: 4px;
      background: linear-gradient(90deg, #312e81, #2563eb 55%, #06b6d4);
    }

    .print-week-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 10px;
      background: linear-gradient(180deg, #eef4ff, #f8fbff);
      border-bottom: 1px solid #dbeafe;
    }

    .print-week-header__left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .print-week-header__left h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: -0.03em;
      white-space: nowrap;
    }

    .print-week-header__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
      color: #334155;
      font-size: 8px;
      font-weight: 800;
      text-align: right;
    }

    .print-week-header__range {
      color: #64748b;
    }

    .print-days {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .print-day {
      border: 1px solid rgba(226, 232, 240, 0.95);
      border-radius: 10px;
      background: linear-gradient(180deg, #ffffff, #f8fafc);
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 7px 8px;
      background: linear-gradient(180deg, #f8fafc, #eff6ff);
      border-bottom: 1px solid #e2e8f0;
    }

    .print-day-header__left {
      display: grid;
      gap: 2px;
    }

    .print-day-header__left h3 {
      margin: 0;
      color: #0f172a;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: -0.03em;
    }

    .print-day-header__left p {
      margin: 0;
      color: #64748b;
      font-size: 8px;
      font-weight: 600;
    }

    .print-day-header__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .print-day-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 18px;
      padding: 0 7px;
      border-radius: 999px;
      background: linear-gradient(
        135deg,
        rgba(79, 70, 229, 0.12),
        rgba(59, 130, 246, 0.12)
      );
      border: 1px solid rgba(79, 70, 229, 0.16);
      color: #1d4ed8;
      font-size: 8px;
      font-weight: 800;
      white-space: nowrap;
    }

    .print-vehicle-groups {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .print-vehicle-group {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background: #ffffff;
    }

    .print-vehicle-group__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 6px 8px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .print-vehicle-group__header strong {
      font-size: 9px;
      font-weight: 900;
      color: #0f172a;
    }

    .print-vehicle-group__header span {
      font-size: 7px;
      font-weight: 700;
      color: #64748b;
    }

    .print-table-wrap {
      overflow: hidden;
    }

    .print-table {
      width: 100%;
      border-collapse: collapse;
    }

    .print-table thead th {
      text-align: left;
      padding: 6px 7px;
      background: linear-gradient(180deg, #eff6ff, #f8fafc);
      border-bottom: 1px solid #dbeafe;
      color: #334155;
      font-size: 7px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .print-table tbody td {
      padding: 6px 7px;
      border-bottom: 1px solid #f1f5f9;
      color: #0f172a;
      font-size: 8px;
      line-height: 1.25;
      vertical-align: middle;
    }

    .print-table tbody tr:nth-child(even) td {
      background: #fbfdff;
    }

    .print-table tbody tr:last-child td {
      border-bottom: none;
    }

    .print-status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 16px;
      padding: 0 6px;
      border-radius: 999px;
      font-size: 7px;
      font-weight: 800;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .print-status-badge--hazirlaniyor {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.2);
      color: #b45309;
    }

    .print-status-badge--hazir {
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.2);
      color: #15803d;
    }

    .print-status-badge--sevk_planlandi {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.2);
      color: #1d4ed8;
    }

    .print-status-badge--sevk_edildi {
      background: rgba(168, 85, 247, 0.12);
      border-color: rgba(168, 85, 247, 0.2);
      color: #7e22ce;
    }

    .print-status-badge--default {
      background: rgba(148, 163, 184, 0.14);
      border-color: rgba(148, 163, 184, 0.2);
      color: #475569;
    }

    .print-notes {
      margin: 6px 8px 8px;
      border-radius: 8px;
      background: linear-gradient(180deg, #fffbeb, #fff7ed);
      border: 1px solid rgba(245, 158, 11, 0.16);
      padding: 6px 7px;
    }

    .print-notes strong {
      display: block;
      color: #92400e;
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .print-notes ul {
      margin: 0;
      padding-left: 14px;
      color: #78350f;
      display: grid;
      gap: 2px;
    }

    .print-notes li {
      font-size: 8px;
      line-height: 1.2;
    }

    .print-notes li span {
      font-weight: 800;
    }

    .print-empty-state {
      padding: 20px 16px;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
    }

    .print-footer {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      padding: 0 12px 12px;
    }

    .print-footer__inline-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      min-height: 40px;
      padding: 6px 7px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 5px;
    }

    .print-footer__inline-box span {
      color: #64748b;
      font-size: 7px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .print-footer__line {
      border-bottom: 1px solid #94a3b8;
      width: 100%;
    }

    @page {
      size: ${pageSize};
      margin: 6mm;
    }

    @media print {
      html, body {
        background: #ffffff !important;
      }

      .print-window-root {
        padding: 0 !important;
      }

      .print-document {
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: none !important;
      }
    }
  `;
}

function buildPrintHtml({ documentHtml, orientation }) {
  const css = getPrintWindowCss(orientation);

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sevkiyat Planı Çıktısı</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="print-window-root">
      ${documentHtml}
    </div>
    <script>
      window.onload = function () {
        setTimeout(function () {
          window.focus();
          window.print();
        }, 400);
      };
    </script>
  </body>
</html>`;
}

export function openDispatchPrintWindow({
  contentElement,
  orientation = "landscape",
}) {
  if (!contentElement) return;

  const printWindow = window.open("", "_blank", "width=1400,height=900");

  if (!printWindow) {
    window.alert("Yazdırma penceresi açılamadı. Tarayıcı popup engelliyor olabilir.");
    return;
  }

  const html = buildPrintHtml({
    documentHtml: contentElement.outerHTML,
    orientation,
  });

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}