import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function toNumber(value, fallback = 0) {
  if (value === '' || value == null) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function pickNumber(source, keys, fallback = 0) {
  if (!source) {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];

    if (value !== '' && value != null && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

function formatKg(value) {
  return `${toNumber(value).toFixed(3)} kg`;
}

function formatCm(value) {
  return `${toNumber(value).toFixed(2)} cm`;
}

function formatCount(value) {
  return String(toNumber(value, 0));
}

function safeText(value, fallback = '-') {
  if (value == null || value === '') {
    return fallback;
  }

  return String(value);
}

function loadImageAsDataUrl(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext('2d');

        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function buildPdfRows({ scenario, products = [], materials = [] }) {
  const productMap = new Map(products.map((item) => [item.id, item]));
  const materialMap = new Map(materials.map((item) => [item.id, item]));

  const palletGroupMap = new Map();
  const stackGroupMap = new Map();

  scenario.values.lots.forEach((lot, lotIndex) => {
    const lotValues = lot.values;
    const product = productMap.get(lotValues.productId);
    const lotResult = scenario.getLotResult(lot.id);

    const lineResultById = new Map(
      (lotResult?.palletLineResults ?? []).map((line) => [line.lineId, line]),
    );

    lotValues.palletLines.forEach((line, lineIndex) => {
      const palletMaterial = materialMap.get(line.palletMaterialId);
      const lineResult = lineResultById.get(line.id);

      const palletCount = Math.max(1, toNumber(line.palletCount, 1));
      const stackGroup = safeText(line.stackGroup, '-');
      const stackOrder = Math.max(1, toNumber(line.stackOrder, 1));

      const grossPerPallet = pickNumber(
        lineResult,
        ['palletGrossWeightKg', 'grossWeightKg'],
        0,
      );

      const totalGross = pickNumber(
        lineResult,
        ['totalLineGrossWeightKg', 'lineGrossWeightKg', 'grossTotalKg'],
        0,
      );

      const netPerPalletDirect = pickNumber(
        lineResult,
        ['palletNetWeightKg', 'netWeightKg'],
        NaN,
      );

      const totalNet = pickNumber(
        lineResult,
        ['totalLineNetWeightKg', 'lineNetWeightKg', 'netTotalKg'],
        NaN,
      );

      const palletHeightCm = pickNumber(
        lineResult,
        ['palletHeightCm', 'heightCm'],
        pickNumber(palletMaterial, ['heightCm', 'height_cm'], 0),
      );

      const resolvedGrossPerPallet =
        grossPerPallet > 0
          ? grossPerPallet
          : totalGross > 0
            ? totalGross / palletCount
            : 0;

      const resolvedNetPerPallet =
        Number.isFinite(netPerPalletDirect) && netPerPalletDirect > 0
          ? netPerPalletDirect
          : Number.isFinite(totalNet) && totalNet > 0
            ? totalNet / palletCount
            : 0;

      const lotNumber = safeText(lotValues.lotNumber, `Lot ${lotIndex + 1}`);
      const productLabel = product?.code
        ? `${product.code} - ${safeText(product?.name, '')}`.trim()
        : safeText(product?.name, '-');

      const palletType = palletMaterial?.code || palletMaterial?.name || '-';

      const palletGroupKey = [
        lot.id,
        line.palletMaterialId,
        stackGroup,
        stackOrder,
        resolvedNetPerPallet.toFixed(3),
        resolvedGrossPerPallet.toFixed(3),
        palletHeightCm.toFixed(2),
      ].join('|');

      const existingPalletGroup =
        palletGroupMap.get(palletGroupKey) || {
          lotNumber,
          productLabel,
          palletType,
          stackGroup,
          stackOrder,
          quantity: 0,
          netKg: resolvedNetPerPallet,
          grossKg: resolvedGrossPerPallet,
          heightCm: palletHeightCm,
        };

      existingPalletGroup.quantity += palletCount;
      palletGroupMap.set(palletGroupKey, existingPalletGroup);

      if (stackGroup !== '-') {
        const stackKey = `${lot.id}:${stackGroup}`;

        const stackExisting =
          stackGroupMap.get(stackKey) || {
            lotNumber,
            productLabel,
            stackGroup,
            palletCount: 0,
            totalNetKg: 0,
            totalGrossKg: 0,
            totalHeightCm: 0,
            levelMap: new Map(),
          };

        stackExisting.palletCount += palletCount;
        stackExisting.totalNetKg += resolvedNetPerPallet * palletCount;
        stackExisting.totalGrossKg += resolvedGrossPerPallet * palletCount;

        const levelExisting = stackExisting.levelMap.get(stackOrder) || {
          grossKg: 0,
          netKg: 0,
          heightCm: 0,
        };

        levelExisting.grossKg += resolvedGrossPerPallet;
        levelExisting.netKg += resolvedNetPerPallet;
        levelExisting.heightCm = Math.max(levelExisting.heightCm, palletHeightCm);

        stackExisting.levelMap.set(stackOrder, levelExisting);
        stackGroupMap.set(stackKey, stackExisting);
      }

      // tek palet ama istifsiz satırların da detayda görünmesi için
      // lineIndex şu an kullanılmıyor, ileride lazım olabilir
      void lineIndex;
    });
  });

  const palletRows = Array.from(palletGroupMap.values()).sort((a, b) => {
    if (a.lotNumber !== b.lotNumber) {
      return a.lotNumber.localeCompare(b.lotNumber, 'tr');
    }

    if (a.stackGroup !== b.stackGroup) {
      return a.stackGroup.localeCompare(b.stackGroup, 'tr');
    }

    return a.stackOrder - b.stackOrder;
  });

  const stackRows = Array.from(stackGroupMap.values())
    .map((item) => {
      const sortedLevels = Array.from(item.levelMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([level, value]) => ({
          level,
          ...value,
        }));

      const totalHeightCm = sortedLevels.reduce(
        (sum, level) => sum + level.heightCm,
        0,
      );

      const levelSummary = sortedLevels
        .map(
          (level) =>
            `${level.level}. Kat: ${formatCm(level.heightCm)} / ${formatKg(level.netKg)} net / ${formatKg(level.grossKg)} brut`,
        )
        .join(' | ');

      return {
        lotNumber: item.lotNumber,
        productLabel: item.productLabel,
        stackGroup: item.stackGroup,
        palletCount: item.palletCount,
        totalNetKg: item.totalNetKg,
        totalGrossKg: item.totalGrossKg,
        totalHeightCm,
        levelSummary,
      };
    })
    .sort((a, b) => {
      if (a.lotNumber !== b.lotNumber) {
        return a.lotNumber.localeCompare(b.lotNumber, 'tr');
      }

      return a.stackGroup.localeCompare(b.stackGroup, 'tr');
    });

  return {
    palletRows,
    stackRows,
  };
}

function addHeader(doc, companyName, logoDataUrl) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 14, 10, 22, 22);
    } catch {
      // ignore image failure
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyName || 'Paketleme Yuk Plani', 42, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Paketleme ve konteyner yerlesim raporu', 42, 24);
}

function addSummaryBox(doc, summary, startY) {
  const x = 14;
  const y = startY;
  const w = 182;
  const h = 28;

  doc.setDrawColor(60, 78, 110);
  doc.setFillColor(244, 247, 251);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Konteyner Ozeti', x + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  doc.text(`Konteyner: ${safeText(summary.containerLabel)}`, x + 4, y + 14);
  doc.text(`Yerlesen Palet: ${formatCount(summary.totalPlacedUnits)}`, x + 4, y + 20);
  doc.text(`Toplam Brut: ${formatKg(summary.totalWeightKg)}`, x + 4, y + 26);

  doc.text(`Doluluk: %${toNumber(summary.occupancyPercent).toFixed(2)}`, x + 78, y + 14);
  doc.text(`Sigmayan: ${formatCount(summary.unplacedCount)}`, x + 78, y + 20);
  doc.text(
    `Boyut: ${safeText(summary.containerWidth)} x ${safeText(summary.containerLength)} x ${safeText(summary.containerHeight)} cm`,
    x + 78,
    y + 26,
  );
}

function addSnapshot(doc, snapshotDataUrl, startY) {
  if (!snapshotDataUrl) {
    return startY;
  }

  try {
    const x = 14;
    const y = startY;
    const w = 182;
    const h = 82;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3D Goruntu', x, y - 2);

    doc.addImage(snapshotDataUrl, 'PNG', x, y, w, h, undefined, 'FAST');
    return y + h;
  } catch {
    return startY;
  }
}

export async function exportContainerLoadPlanPdf({
  scenario,
  products = [],
  materials = [],
  containerSummary,
  companyName,
  logoSrc,
  snapshotDataUrl,
}) {
  const { palletRows, stackRows } = buildPdfRows({
    scenario,
    products,
    materials,
  });

  const logoDataUrl = await loadImageAsDataUrl(logoSrc);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const createdAt = new Date();
  const createdAtLabel = createdAt.toLocaleString('tr-TR');

  addHeader(doc, companyName || 'Paketleme Yuk Plani', logoDataUrl);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Olusturma Tarihi: ${createdAtLabel}`, 14, 36);

  addSummaryBox(
    doc,
    {
      containerLabel: containerSummary?.containerLabel || '-',
      totalPlacedUnits: containerSummary?.totalPlacedUnits || 0,
      totalWeightKg: containerSummary?.totalWeightKg || 0,
      occupancyPercent: containerSummary?.occupancyPercent || 0,
      unplacedCount: containerSummary?.unplacedCount || 0,
      containerWidth: containerSummary?.containerWidth || '-',
      containerLength: containerSummary?.containerLength || '-',
      containerHeight: containerSummary?.containerHeight || '-',
    },
    42,
  );

  let cursorY = 76;
  cursorY = addSnapshot(doc, snapshotDataUrl, cursorY + 6) + 10;

  autoTable(doc, {
    startY: cursorY,
    head: [[
      'Lot',
      'Urun',
      'Palet Tipi',
      'Istif',
      'Kat',
      'Adet',
      'Tekil Net',
      'Tekil Brut',
      'Tekil Yukseklik',
    ]],
    body: palletRows.map((row) => [
      row.lotNumber,
      row.productLabel,
      row.palletType,
      row.stackGroup,
      `${row.stackOrder}. Kat`,
      String(row.quantity),
      formatKg(row.netKg),
      formatKg(row.grossKg),
      formatCm(row.heightCm),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.1,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [41, 55, 90],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 10, right: 10 },
  });

  const nextY = doc.lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: nextY,
    head: [[
      'Lot',
      'Urun',
      'Istif',
      'Palet Sayisi',
      'Toplam Net',
      'Toplam Brut',
      'Toplam Yukseklik',
      'Kat Ozeti',
    ]],
    body: stackRows.length
      ? stackRows.map((row) => [
          row.lotNumber,
          row.productLabel,
          row.stackGroup,
          String(row.palletCount),
          formatKg(row.totalNetKg),
          formatKg(row.totalGrossKg),
          formatCm(row.totalHeightCm),
          row.levelSummary,
        ])
      : [[
          '-',
          '-',
          'Istif yok',
          '-',
          '-',
          '-',
          '-',
          '-',
        ]],
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [25, 90, 65],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 10, right: 10 },
    columnStyles: {
      7: { cellWidth: 52 },
    },
  });

  doc.save('paketleme-yuk-plani-premium.pdf');
}