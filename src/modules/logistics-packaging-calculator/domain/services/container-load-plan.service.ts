import type {
  ContainerDimensions,
  ContainerLoadPlan,
  ContainerLoadPlanBalanceSummary,
  ContainerLoadPlanLegendItem,
  ContainerLoadPlanLotInput,
  ContainerLoadPlanLotInputPalletLine,
  ContainerLoadPlanPlacement,
  ContainerLoadPlanUnplacedItem,
} from '../types/container-load-plan.type';

interface BuildContainerLoadPlanParams {
  lots: ContainerLoadPlanLotInput[];
  container: ContainerDimensions;
}

interface StackBaseSlot {
  xCm: number;
  zCm: number;
  widthCm: number;
  lengthCm: number;
  baseTopYForNextLevelCm: number;
  rotated: boolean;
}

type LoadUnitPlacement = {
  xOffsetCm: number;
  zOffsetCm: number;
  yOffsetCm?: number;
  diameterCm?: number;
  widthCm?: number;
  lengthCm?: number;
  heightCm?: number;
};

type DebugPackedLayout = {
  kind: 'cylinder' | 'box';
  palletWidthCm: number;
  palletLengthCm: number;
  unitCount: number;
  unitWidthCm?: number;
  unitLengthCm?: number;
  diameterCm?: number;
  chosenGapCm: number;
  rows: number;
  cols: number;
  axis: 'row-major' | 'col-major' | 'single';
  placements: LoadUnitPlacement[];
};

type LoadUnitPackingConfig =
  | number
  | string
  | null
  | undefined
  | {
      unitsPerPallet?: number | string | null;
      unitsPerRow?: number | string | null;
    };

interface FloorRequest {
  placementId: string;
  lot: ContainerLoadPlanLotInput;
  line: ContainerLoadPlanLotInputPalletLine;
  lotColor: string;
  baseWidth: number;
  baseLength: number;
  baseHeight: number;
  baseWeight: number;
  stackGroup: string | null;
  stackOrder: number;
}

interface FreeRect {
  xCm: number;
  zCm: number;
  widthCm: number;
  lengthCm: number;
}

interface PlacementCandidate {
  rectIndex: number;
  xCm: number;
  zCm: number;
  widthCm: number;
  lengthCm: number;
  rotated: boolean;
  shortSideFit: number;
  longSideFit: number;
  areaFit: number;
}

const LOT_COLORS = [
  '#6366f1',
  '#06b6d4',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#f97316',
];

function toPositiveNumber(
  value: number | string | null | undefined,
  fallback = 0,
): number {
  if (value === '' || value == null) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function getLotColor(index: number): string {
  return LOT_COLORS[index % LOT_COLORS.length];
}

function isDrumLikeLot(lot: ContainerLoadPlanLotInput): boolean {
  const code = String(lot.loadMaterialCode || '').toUpperCase();
  const name = String(lot.loadMaterialName || '').toUpperCase();
  const type = String(lot.loadMaterialType || '').toUpperCase();

  return (
    code.includes('VRL') ||
    name.includes('VARIL') ||
    name.includes('DRUM') ||
    type.includes('DRUM')
  );
}

function getDefaultFootprint(
  lot: ContainerLoadPlanLotInput,
): { widthCm: number; lengthCm: number; shape: 'box' | 'cylinder' } {
  if (isDrumLikeLot(lot)) {
    return { widthCm: 80, lengthCm: 120, shape: 'cylinder' };
  }

  return { widthCm: 80, lengthCm: 120, shape: 'box' };
}

function getPalletBaseHeightCm(line: ContainerLoadPlanLotInputPalletLine): number {
  const materialHeight = toPositiveNumber(line.palletHeightCm, 0);

  if (materialHeight > 0 && materialHeight < 40) {
    return materialHeight;
  }

  return 14;
}

function getTotalPlacementHeightCm(
  lot: ContainerLoadPlanLotInput,
  line: ContainerLoadPlanLotInputPalletLine,
): number {
  const explicitHeight = toPositiveNumber(line.palletHeightCm, 0);

  if (explicitHeight > 0) {
    return explicitHeight;
  }

  const loadHeight = toPositiveNumber(lot.loadUnitHeightCm, 0);
  const palletBaseHeight = getPalletBaseHeightCm(line);

  if (loadHeight > 0) {
    return palletBaseHeight + loadHeight;
  }

  return isDrumLikeLot(lot) ? 104 : 120;
}

function getLoadHeightCm(
  lot: ContainerLoadPlanLotInput,
  line: ContainerLoadPlanLotInputPalletLine,
): number {
  const totalHeight = getTotalPlacementHeightCm(lot, line);
  const palletBaseHeight = getPalletBaseHeightCm(line);
  return Math.max(10, totalHeight - palletBaseHeight);
}

function getPlacementWeight(line: ContainerLoadPlanLotInputPalletLine): number {
  const palletGross = toPositiveNumber(line.palletGrossWeightKg, 0);

  if (palletGross > 0) {
    return palletGross;
  }

  const totalLineGross = toPositiveNumber(line.totalLineGrossWeightKg, 0);
  const palletCount = toPositiveNumber(line.palletCount, 1);

  if (totalLineGross > 0 && palletCount > 0) {
    return round(totalLineGross / palletCount, 3);
  }

  return 0;
}

function buildLegend(lots: ContainerLoadPlanLotInput[]): ContainerLoadPlanLegendItem[] {
  return lots.map((lot, index) => ({
    lotId: lot.id,
    lotNumber: lot.lotNumber || `Lot ${index + 1}`,
    label: lot.productCode
      ? `${lot.lotNumber || `Lot ${index + 1}`} · ${lot.productCode}`
      : lot.productName || lot.lotNumber || `Lot ${index + 1}`,
    color: getLotColor(index),
  }));
}

function calculateBalance(
  placements: ContainerLoadPlanPlacement[],
  container: ContainerDimensions,
): ContainerLoadPlanBalanceSummary {
  const halfWidth = container.innerWidthCm / 2;
  const halfLength = container.innerLengthCm / 2;

  const leftWeightKg = placements
    .filter((item: ContainerLoadPlanPlacement) => item.xCm + item.widthCm / 2 <= halfWidth)
    .reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0);

  const rightWeightKg = placements
    .filter((item: ContainerLoadPlanPlacement) => item.xCm + item.widthCm / 2 > halfWidth)
    .reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0);

  const frontWeightKg = placements
    .filter((item: ContainerLoadPlanPlacement) => item.zCm + item.lengthCm / 2 <= halfLength)
    .reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0);

  const rearWeightKg = placements
    .filter((item: ContainerLoadPlanPlacement) => item.zCm + item.lengthCm / 2 > halfLength)
    .reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0);

  const totalWeightKg = round(
    placements.reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0),
    3,
  );

  return {
    totalWeightKg,
    leftWeightKg: round(leftWeightKg, 3),
    rightWeightKg: round(rightWeightKg, 3),
    frontWeightKg: round(frontWeightKg, 3),
    rearWeightKg: round(rearWeightKg, 3),
    leftRightDeltaKg: round(Math.abs(leftWeightKg - rightWeightKg), 3),
    frontRearDeltaKg: round(Math.abs(frontWeightKg - rearWeightKg), 3),
  };
}

function fitDrumsOnPallet(
  palletWidthCm: number,
  palletLengthCm: number,
  unitCount: number,
  lot: ContainerLoadPlanLotInput,
): DebugPackedLayout {
  const diameter = toPositiveNumber(
    lot.loadUnitWidthCm,
    Math.min(palletWidthCm, palletLengthCm) * 0.42,
  );

  const candidateGaps = [8, 6, 4, 2, 1, 0];

  for (const gap of candidateGaps) {
    for (let rows = 1; rows <= unitCount; rows += 1) {
      const cols = Math.ceil(unitCount / rows);

      const requiredWidth = cols * diameter + (cols - 1) * gap;
      const requiredLength = rows * diameter + (rows - 1) * gap;

      if (requiredWidth <= palletWidthCm && requiredLength <= palletLengthCm) {
        const startX = (palletWidthCm - requiredWidth) / 2 + diameter / 2;
        const startZ = (palletLengthCm - requiredLength) / 2 + diameter / 2;

        const placements: LoadUnitPlacement[] = [];

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            if (placements.length >= unitCount) {
              break;
            }

            placements.push({
              xOffsetCm: round(startX + col * (diameter + gap), 2),
              zOffsetCm: round(startZ + row * (diameter + gap), 2),
              yOffsetCm: 0,
              diameterCm: round(diameter, 2),
              heightCm: round(toPositiveNumber(lot.loadUnitHeightCm, diameter), 2),
            });
          }
        }

        return {
          kind: 'cylinder',
          palletWidthCm,
          palletLengthCm,
          unitCount,
          diameterCm: round(diameter, 2),
          chosenGapCm: gap,
          rows,
          cols,
          axis: 'row-major',
          placements,
        };
      }
    }

    for (let cols = 1; cols <= unitCount; cols += 1) {
      const rows = Math.ceil(unitCount / cols);

      const requiredWidth = cols * diameter + (cols - 1) * gap;
      const requiredLength = rows * diameter + (rows - 1) * gap;

      if (requiredWidth <= palletWidthCm && requiredLength <= palletLengthCm) {
        const startX = (palletWidthCm - requiredWidth) / 2 + diameter / 2;
        const startZ = (palletLengthCm - requiredLength) / 2 + diameter / 2;

        const placements: LoadUnitPlacement[] = [];

        for (let col = 0; col < cols; col += 1) {
          for (let row = 0; row < rows; row += 1) {
            if (placements.length >= unitCount) {
              break;
            }

            placements.push({
              xOffsetCm: round(startX + col * (diameter + gap), 2),
              zOffsetCm: round(startZ + row * (diameter + gap), 2),
              yOffsetCm: 0,
              diameterCm: round(diameter, 2),
              heightCm: round(toPositiveNumber(lot.loadUnitHeightCm, diameter), 2),
            });
          }
        }

        return {
          kind: 'cylinder',
          palletWidthCm,
          palletLengthCm,
          unitCount,
          diameterCm: round(diameter, 2),
          chosenGapCm: gap,
          rows,
          cols,
          axis: 'col-major',
          placements,
        };
      }
    }
  }

  return {
    kind: 'cylinder',
    palletWidthCm,
    palletLengthCm,
    unitCount,
    diameterCm: round(Math.min(diameter, Math.min(palletWidthCm, palletLengthCm) - 4), 2),
    chosenGapCm: 0,
    rows: 1,
    cols: 1,
    axis: 'single',
    placements: [
  {
    xOffsetCm: round(palletWidthCm / 2, 2),
    zOffsetCm: round(palletLengthCm / 2, 2),
    yOffsetCm: 0,
    diameterCm: round(Math.min(diameter, Math.min(palletWidthCm, palletLengthCm) - 4), 2),
    heightCm: round(toPositiveNumber(lot.loadUnitHeightCm, diameter), 2),
       },
    ],
  };
}

function fitBoxesOnPallet(
  palletWidthCm: number,
  palletLengthCm: number,
  unitCount: number,
  lot: ContainerLoadPlanLotInput,
  unitsPerRowRaw?: number | string | null,
  totalLoadHeightCm?: number,
): DebugPackedLayout {
  const requestedUnitsPerRow = Math.max(
    1,
    Math.min(unitCount, toPositiveNumber(unitsPerRowRaw, unitCount)),
  );

  const rawBoxWidth = toPositiveNumber(
    lot.loadUnitWidthCm,
    Math.max(10, palletWidthCm * 0.2),
  );
  const rawBoxLength = toPositiveNumber(
    lot.loadUnitLengthCm,
    Math.max(10, palletLengthCm * 0.2),
  );

  const resolvedTotalLoadHeightCm = Math.max(
    10,
    toPositiveNumber(lot.loadUnitHeightCm, totalLoadHeightCm ?? 30),
  );

  const candidateGaps = [1, 0];
  const softOverflowToleranceCm = 5;

  type BaseGrid = {
    rows: number;
    cols: number;
    gap: number;
    unitWidthCm: number;
    unitLengthCm: number;
    positions: Array<{ xOffsetCm: number; zOffsetCm: number }>;
    capacity: number;
    overflowCm: number;
    score: number;
  };

  let bestGrid: BaseGrid | null = null;
  let bestFallbackGrid: BaseGrid | null = null;

  const orientationOptions = [
    { unitWidthCm: rawBoxWidth, unitLengthCm: rawBoxLength },
    { unitWidthCm: rawBoxLength, unitLengthCm: rawBoxWidth },
  ].filter(
    (item, index, list) =>
      index ===
      list.findIndex(
        (other) =>
          other.unitWidthCm === item.unitWidthCm &&
          other.unitLengthCm === item.unitLengthCm,
      ),
  );

  for (const gap of candidateGaps) {
    for (const orientation of orientationOptions) {
      for (let rows = 1; rows <= requestedUnitsPerRow; rows += 1) {
        if (requestedUnitsPerRow % rows !== 0) {
          continue;
        }

        const cols = requestedUnitsPerRow / rows;

        const usedWidth = cols * orientation.unitWidthCm + (cols - 1) * gap;
        const usedLength = rows * orientation.unitLengthCm + (rows - 1) * gap;

        const overflowWidth = Math.max(0, usedWidth - palletWidthCm);
        const overflowLength = Math.max(0, usedLength - palletLengthCm);
        const overflowCm = overflowWidth + overflowLength;

        const startX =
          (palletWidthCm - usedWidth) / 2 + orientation.unitWidthCm / 2;
        const startZ =
          (palletLengthCm - usedLength) / 2 + orientation.unitLengthCm / 2;

        const positions: Array<{ xOffsetCm: number; zOffsetCm: number }> = [];

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            positions.push({
              xOffsetCm: round(
                startX + col * (orientation.unitWidthCm + gap),
                2,
              ),
              zOffsetCm: round(
                startZ + row * (orientation.unitLengthCm + gap),
                2,
              ),
            });
          }
        }

        const shapePenalty = Math.abs(rows - cols) * 4;
        const overflowPenalty = overflowCm * 1000;
        const score = overflowPenalty + shapePenalty + gap * 10;

        const candidate: BaseGrid = {
          rows,
          cols,
          gap,
          unitWidthCm: orientation.unitWidthCm,
          unitLengthCm: orientation.unitLengthCm,
          positions,
          capacity: rows * cols,
          overflowCm,
          score,
        };

        if (overflowCm <= softOverflowToleranceCm) {
          if (!bestGrid || candidate.score < bestGrid.score) {
            bestGrid = candidate;
          }
        }

        if (!bestFallbackGrid || candidate.score < bestFallbackGrid.score) {
          bestFallbackGrid = candidate;
        }
      }
    }
  }

  const chosenGrid = bestGrid ?? bestFallbackGrid;

  if (!chosenGrid) {
    const fallbackHeight = resolvedTotalLoadHeightCm / Math.max(1, unitCount);

    return {
      kind: 'box',
      palletWidthCm,
      palletLengthCm,
      unitCount,
      unitWidthCm: round(rawBoxWidth, 2),
      unitLengthCm: round(rawBoxLength, 2),
      chosenGapCm: 0,
      rows: 1,
      cols: 1,
      axis: 'single',
      placements: Array.from({ length: unitCount }).map((_, layerIndex) => ({
        xOffsetCm: round(palletWidthCm / 2, 2),
        zOffsetCm: round(palletLengthCm / 2, 2),
        yOffsetCm: round(layerIndex * fallbackHeight, 2),
        widthCm: round(rawBoxWidth, 2),
        lengthCm: round(rawBoxLength, 2),
        heightCm: round(fallbackHeight, 2),
      })),
    };
  }

  const layerCapacity = chosenGrid.capacity;
  const layerCount = Math.max(1, Math.ceil(unitCount / layerCapacity));
  const verticalGapCm = layerCount > 1 ? 0.8 : 0;

  const unitHeightCm = Math.max(
    2,
    (resolvedTotalLoadHeightCm - verticalGapCm * (layerCount - 1)) / layerCount,
  );

  const placements: LoadUnitPlacement[] = [];
  let placedCount = 0;

  function buildCenteredBlockPositions(
    count: number,
    rows: number,
    cols: number,
    palletWidthCmLocal: number,
    palletLengthCmLocal: number,
    unitWidthCmLocal: number,
    unitLengthCmLocal: number,
    gapCm: number,
  ): Array<{ xOffsetCm: number; zOffsetCm: number }> {
    if (count <= 0) {
      return [];
    }

    let bestRows = 1;
    let bestCols = count;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let candidateRows = 1; candidateRows <= count; candidateRows += 1) {
      const candidateCols = Math.ceil(count / candidateRows);

      if (candidateRows > rows || candidateCols > cols) {
        continue;
      }

      const diff = Math.abs(candidateRows - candidateCols);
      const area = candidateRows * candidateCols;
      const emptyCells = area - count;
      const score = diff * 100 + emptyCells * 10 + area;

      if (score < bestScore) {
        bestScore = score;
        bestRows = candidateRows;
        bestCols = candidateCols;
      }
    }

    const blockWidthCm =
      bestCols * unitWidthCmLocal + (bestCols - 1) * gapCm;
    const blockLengthCm =
      bestRows * unitLengthCmLocal + (bestRows - 1) * gapCm;

    const startX =
      (palletWidthCmLocal - blockWidthCm) / 2 + unitWidthCmLocal / 2;
    const startZ =
      (palletLengthCmLocal - blockLengthCm) / 2 + unitLengthCmLocal / 2;

    const positions: Array<{ xOffsetCm: number; zOffsetCm: number }> = [];

    for (let row = 0; row < bestRows; row += 1) {
      for (let col = 0; col < bestCols; col += 1) {
        if (positions.length >= count) {
          break;
        }

        positions.push({
          xOffsetCm: round(startX + col * (unitWidthCmLocal + gapCm), 2),
          zOffsetCm: round(startZ + row * (unitLengthCmLocal + gapCm), 2),
        });
      }
    }

    return positions;
  }

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
    const remaining = unitCount - placedCount;
    const countInThisLayer = Math.min(chosenGrid.positions.length, remaining);

    const positionsForLayer =
      countInThisLayer === chosenGrid.positions.length
        ? chosenGrid.positions
        : buildCenteredBlockPositions(
            countInThisLayer,
            chosenGrid.rows,
            chosenGrid.cols,
            palletWidthCm,
            palletLengthCm,
            chosenGrid.unitWidthCm,
            chosenGrid.unitLengthCm,
            chosenGrid.gap,
          );

    for (const position of positionsForLayer) {
      if (placedCount >= unitCount) {
        break;
      }

      placements.push({
        xOffsetCm: position.xOffsetCm,
        zOffsetCm: position.zOffsetCm,
        yOffsetCm: round(layerIndex * (unitHeightCm + verticalGapCm), 2),
        widthCm: round(chosenGrid.unitWidthCm, 2),
        lengthCm: round(chosenGrid.unitLengthCm, 2),
        heightCm: round(unitHeightCm, 2),
      });

      placedCount += 1;
    }
  }

  return {
    kind: 'box',
    palletWidthCm,
    palletLengthCm,
    unitCount,
    unitWidthCm: round(chosenGrid.unitWidthCm, 2),
    unitLengthCm: round(chosenGrid.unitLengthCm, 2),
    chosenGapCm: chosenGrid.gap,
    rows: chosenGrid.rows,
    cols: chosenGrid.cols,
    axis: 'row-major',
    placements,
  };
}

function createPlacement(params: {
  placementId: string;
  lot: ContainerLoadPlanLotInput;
  line: ContainerLoadPlanLotInputPalletLine;
  lotColor: string;
  xCm: number;
  yCm: number;
  zCm: number;
  widthCm: number;
  lengthCm: number;
  rotated: boolean;
  stackGroup: string | null;
  stackOrder: number;
}): ContainerLoadPlanPlacement {
  const { lot, line } = params;
  const palletBaseHeightCm = getPalletBaseHeightCm(line);
  const totalHeightCm = getTotalPlacementHeightCm(lot, line);
  const loadHeightCm = getLoadHeightCm(lot, line);
  const shape = isDrumLikeLot(lot) ? 'cylinder' : 'box';

  const loadWidthCm =
    shape === 'cylinder'
      ? Math.min(
          params.widthCm - 10,
          toPositiveNumber(
            lot.loadUnitWidthCm,
            Math.min(params.widthCm, params.lengthCm) * 0.42,
          ),
        )
      : Math.max(
          10,
          Math.min(params.widthCm - 8, toPositiveNumber(lot.loadUnitWidthCm, params.widthCm - 8)),
        );

  const loadLengthCm =
    shape === 'cylinder'
      ? Math.min(
          params.lengthCm - 10,
          toPositiveNumber(
            lot.loadUnitLengthCm,
            Math.min(params.widthCm, params.lengthCm) * 0.42,
          ),
        )
      : Math.max(
          10,
          Math.min(
            params.lengthCm - 8,
            toPositiveNumber(lot.loadUnitLengthCm, params.lengthCm - 8),
          ),
        );

  return {
    id: params.placementId,
    lotId: lot.id,
    lotNumber: lot.lotNumber || '',
    productId: lot.productId,
    productName: lot.productName || '',
    productCode: lot.productCode || '',
    palletLineId: line.id,
    palletMaterialId: line.palletMaterialId,
    palletMaterialCode: line.palletMaterialCode || '',
    palletMaterialName: line.palletMaterialName || '',
    loadMaterialId: lot.loadMaterialId || '',
    loadMaterialCode: lot.loadMaterialCode || '',
    loadMaterialName: lot.loadMaterialName || '',
    loadMaterialType: lot.loadMaterialType || '',
    shape,
    color: params.lotColor,
    xCm: params.xCm,
    yCm: params.yCm,
    zCm: params.zCm,
    widthCm: params.widthCm,
    lengthCm: params.lengthCm,
    heightCm: totalHeightCm,
    palletBaseHeightCm,
    loadWidthCm: round(loadWidthCm, 2),
    loadLengthCm: round(loadLengthCm, 2),
    loadHeightCm,
    weightKg: getPlacementWeight(line),
    stackGroup: params.stackGroup,
    stackOrder: params.stackOrder,
    rotated: params.rotated,
    footprintAreaCm2: round(params.widthCm * params.lengthCm, 2),
  };
}

function buildFloorRequests(
  lots: ContainerLoadPlanLotInput[],
  colorByLotId: Map<string, string>,
): {
  floorRequests: FloorRequest[];
  upperStackRequests: FloorRequest[];
} {
  const floorRequests: FloorRequest[] = [];
  const upperStackRequests: FloorRequest[] = [];

  lots.forEach((lot: ContainerLoadPlanLotInput, lotIndex: number) => {
    lot.palletLines.forEach((line: ContainerLoadPlanLotInputPalletLine) => {
      const palletCount = toPositiveNumber(line.palletCount, 1);
      const footprint = getDefaultFootprint(lot);
      const baseWidth = toPositiveNumber(line.palletWidthCm, footprint.widthCm);
      const baseLength = toPositiveNumber(line.palletLengthCm, footprint.lengthCm);
      const baseHeight = getTotalPlacementHeightCm(lot, line);
      const baseWeight = getPlacementWeight(line);
      const stackGroup = line.stackGroup?.trim() || null;
      const stackOrder = toPositiveNumber(line.stackOrder, 1);
      const lotColor = colorByLotId.get(lot.id) || getLotColor(lotIndex);

      for (let i = 0; i < palletCount; i += 1) {
        const request: FloorRequest = {
          placementId: `${lot.id}:${line.id}:${i + 1}`,
          lot,
          line,
          lotColor,
          baseWidth,
          baseLength,
          baseHeight,
          baseWeight,
          stackGroup,
          stackOrder,
        };

        if (stackGroup && stackOrder > 1) {
          upperStackRequests.push(request);
        } else {
          floorRequests.push(request);
        }
      }
    });
  });

  return {
    floorRequests,
    upperStackRequests,
  };
}

function chooseBestCandidate(
  request: FloorRequest,
  freeRects: FreeRect[],
): PlacementCandidate | null {
  let best: PlacementCandidate | null = null;

  const orientations = [
    {
      widthCm: request.baseWidth,
      lengthCm: request.baseLength,
      rotated: false,
    },
    {
      widthCm: request.baseLength,
      lengthCm: request.baseWidth,
      rotated: true,
    },
  ].filter(
    (item, index, list) =>
      index ===
      list.findIndex(
        (other) =>
          other.widthCm === item.widthCm &&
          other.lengthCm === item.lengthCm &&
          other.rotated === item.rotated,
      ),
  );

  freeRects.forEach((rect: FreeRect, rectIndex: number) => {
    orientations.forEach((orientation) => {
      if (
        orientation.widthCm > rect.widthCm ||
        orientation.lengthCm > rect.lengthCm
      ) {
        return;
      }

      const leftoverHoriz = rect.widthCm - orientation.widthCm;
      const leftoverVert = rect.lengthCm - orientation.lengthCm;

      const candidate: PlacementCandidate = {
        rectIndex,
        xCm: rect.xCm,
        zCm: rect.zCm,
        widthCm: orientation.widthCm,
        lengthCm: orientation.lengthCm,
        rotated: orientation.rotated,
        shortSideFit: Math.min(leftoverHoriz, leftoverVert),
        longSideFit: Math.max(leftoverHoriz, leftoverVert),
        areaFit: rect.widthCm * rect.lengthCm - orientation.widthCm * orientation.lengthCm,
      };

      if (!best) {
        best = candidate;
        return;
      }

      if (candidate.shortSideFit < best.shortSideFit) {
        best = candidate;
        return;
      }

      if (
        candidate.shortSideFit === best.shortSideFit &&
        candidate.longSideFit < best.longSideFit
      ) {
        best = candidate;
        return;
      }

      if (
        candidate.shortSideFit === best.shortSideFit &&
        candidate.longSideFit === best.longSideFit &&
        candidate.areaFit < best.areaFit
      ) {
        best = candidate;
      }
    });
  });

  return best;
}

function splitFreeRect(
  rect: FreeRect,
  placed: PlacementCandidate,
): FreeRect[] {
  const result: FreeRect[] = [];

  const rightWidth = rect.widthCm - placed.widthCm;
  if (rightWidth > 0) {
    result.push({
      xCm: rect.xCm + placed.widthCm,
      zCm: rect.zCm,
      widthCm: rightWidth,
      lengthCm: rect.lengthCm,
    });
  }

  const bottomLength = rect.lengthCm - placed.lengthCm;
  if (bottomLength > 0) {
    result.push({
      xCm: rect.xCm,
      zCm: rect.zCm + placed.lengthCm,
      widthCm: placed.widthCm,
      lengthCm: bottomLength,
    });
  }

  return result;
}

function rectContains(a: FreeRect, b: FreeRect): boolean {
  return (
    b.xCm >= a.xCm &&
    b.zCm >= a.zCm &&
    b.xCm + b.widthCm <= a.xCm + a.widthCm &&
    b.zCm + b.lengthCm <= a.zCm + a.lengthCm
  );
}

function pruneFreeRects(rects: FreeRect[]): FreeRect[] {
  return rects.filter((rect: FreeRect, index: number) => {
    return !rects.some((other: FreeRect, otherIndex: number) => {
      if (index === otherIndex) {
        return false;
      }

      return rectContains(other, rect);
    });
  });
}

function sortRequestsForPacking(requests: FloorRequest[]): FloorRequest[] {
  return [...requests].sort((a: FloorRequest, b: FloorRequest) => {
    const areaA = a.baseWidth * a.baseLength;
    const areaB = b.baseWidth * b.baseLength;

    if (areaA !== areaB) {
      return areaB - areaA;
    }

    if (a.baseHeight !== b.baseHeight) {
      return b.baseHeight - a.baseHeight;
    }

    return b.baseWeight - a.baseWeight;
  });
}

function packFloorRequests(params: {
  floorRequests: FloorRequest[];
  container: ContainerDimensions;
}): {
  placements: ContainerLoadPlanPlacement[];
  unplaced: ContainerLoadPlanUnplacedItem[];
  stackSlotsByGroup: Map<string, StackBaseSlot[]>;
} {
  const { floorRequests, container } = params;

  const placements: ContainerLoadPlanPlacement[] = [];
  const unplaced: ContainerLoadPlanUnplacedItem[] = [];
  const stackSlotsByGroup = new Map<string, StackBaseSlot[]>();

  let freeRects: FreeRect[] = [
    {
      xCm: 0,
      zCm: 0,
      widthCm: container.innerWidthCm,
      lengthCm: container.innerLengthCm,
    },
  ];

  const sortedRequests = sortRequestsForPacking(floorRequests);

  for (const request of sortedRequests) {
    if (request.baseHeight > container.innerHeightCm) {
      unplaced.push({
        id: request.placementId,
        lotId: request.lot.id,
        lotNumber: request.lot.lotNumber || '-',
        palletLineId: request.line.id,
        palletMaterialCode:
          request.line.palletMaterialCode || request.line.palletMaterialName || '-',
        reason: 'HEIGHT_LIMIT',
        widthCm: request.baseWidth,
        lengthCm: request.baseLength,
        heightCm: request.baseHeight,
        weightKg: request.baseWeight,
      });
      continue;
    }

    const candidate = chooseBestCandidate(request, freeRects);

    if (!candidate) {
      unplaced.push({
        id: request.placementId,
        lotId: request.lot.id,
        lotNumber: request.lot.lotNumber || '-',
        palletLineId: request.line.id,
        palletMaterialCode:
          request.line.palletMaterialCode || request.line.palletMaterialName || '-',
        reason: 'NO_FLOOR_SPACE',
        widthCm: request.baseWidth,
        lengthCm: request.baseLength,
        heightCm: request.baseHeight,
        weightKg: request.baseWeight,
      });
      continue;
    }

    const placement = createPlacement({
      placementId: request.placementId,
      lot: request.lot,
      line: request.line,
      lotColor: request.lotColor,
      xCm: candidate.xCm,
      yCm: 0,
      zCm: candidate.zCm,
      widthCm: candidate.widthCm,
      lengthCm: candidate.lengthCm,
      rotated: candidate.rotated,
      stackGroup: request.stackGroup,
      stackOrder: request.stackOrder,
    });

    placements.push(placement);

    const targetRect = freeRects[candidate.rectIndex];
    const nextRects = splitFreeRect(targetRect, candidate);

    freeRects = freeRects.filter((_, index: number) => index !== candidate.rectIndex);
    freeRects.push(...nextRects);
    freeRects = pruneFreeRects(freeRects);

    if (request.stackGroup) {
      const slots = stackSlotsByGroup.get(request.stackGroup) ?? [];
      slots.push({
        xCm: placement.xCm,
        zCm: placement.zCm,
        widthCm: placement.widthCm,
        lengthCm: placement.lengthCm,
        baseTopYForNextLevelCm: placement.heightCm,
        rotated: placement.rotated,
      });
      stackSlotsByGroup.set(request.stackGroup, slots);
    }
  }

  return {
    placements,
    unplaced,
    stackSlotsByGroup,
  };
}

function packUpperStacks(params: {
  upperStackRequests: FloorRequest[];
  stackSlotsByGroup: Map<string, StackBaseSlot[]>;
  container: ContainerDimensions;
}): {
  placements: ContainerLoadPlanPlacement[];
  unplaced: ContainerLoadPlanUnplacedItem[];
} {
  const { upperStackRequests, stackSlotsByGroup, container } = params;
  const placements: ContainerLoadPlanPlacement[] = [];
  const unplaced: ContainerLoadPlanUnplacedItem[] = [];

  upperStackRequests.forEach((request: FloorRequest) => {
    const slots = request.stackGroup
      ? stackSlotsByGroup.get(request.stackGroup) ?? []
      : [];

    if (slots.length === 0) {
      unplaced.push({
        id: request.placementId,
        lotId: request.lot.id,
        lotNumber: request.lot.lotNumber || '-',
        palletLineId: request.line.id,
        palletMaterialCode:
          request.line.palletMaterialCode || request.line.palletMaterialName || '-',
        reason: 'MISSING_STACK_BASE',
        widthCm: request.baseWidth,
        lengthCm: request.baseLength,
        heightCm: request.baseHeight,
        weightKg: request.baseWeight,
      });
      return;
    }

    const slot = slots.shift();

    if (!slot) {
      return;
    }

    if (slot.baseTopYForNextLevelCm + request.baseHeight > container.innerHeightCm) {
      unplaced.push({
        id: request.placementId,
        lotId: request.lot.id,
        lotNumber: request.lot.lotNumber || '-',
        palletLineId: request.line.id,
        palletMaterialCode:
          request.line.palletMaterialCode || request.line.palletMaterialName || '-',
        reason: 'HEIGHT_LIMIT',
        widthCm: slot.widthCm,
        lengthCm: slot.lengthCm,
        heightCm: request.baseHeight,
        weightKg: request.baseWeight,
      });
      return;
    }

    const placement = createPlacement({
      placementId: request.placementId,
      lot: request.lot,
      line: request.line,
      lotColor: request.lotColor,
      xCm: slot.xCm,
      yCm: slot.baseTopYForNextLevelCm,
      zCm: slot.zCm,
      widthCm: slot.widthCm,
      lengthCm: slot.lengthCm,
      rotated: slot.rotated,
      stackGroup: request.stackGroup,
      stackOrder: request.stackOrder,
    });

    placements.push(placement);

    slot.baseTopYForNextLevelCm += placement.heightCm;
    slots.push(slot);

    if (request.stackGroup) {
      stackSlotsByGroup.set(request.stackGroup, slots);
    }
  });

  return {
    placements,
    unplaced,
  };
}

export function buildContainerLoadPlan({
  lots,
  container,
}: BuildContainerLoadPlanParams): ContainerLoadPlan {
  const legend = buildLegend(lots);
  const colorByLotId = new Map(
    legend.map((item: ContainerLoadPlanLegendItem) => [item.lotId, item.color]),
  );

  const { floorRequests, upperStackRequests } = buildFloorRequests(
    lots,
    colorByLotId,
  );

  const floorResult = packFloorRequests({
    floorRequests,
    container,
  });

  const upperResult = packUpperStacks({
    upperStackRequests,
    stackSlotsByGroup: floorResult.stackSlotsByGroup,
    container,
  });

  const placements = [...floorResult.placements, ...upperResult.placements];
  const unplaced = [...floorResult.unplaced, ...upperResult.unplaced];

  const containerFloorArea = container.innerWidthCm * container.innerLengthCm;
  const occupiedArea = floorResult.placements.reduce(
    (sum: number, item: ContainerLoadPlanPlacement) => sum + item.widthCm * item.lengthCm,
    0,
  );

  return {
    container,
    placements,
    unplaced,
    legend,
    balance: calculateBalance(placements, container),
    occupancyPercent:
      containerFloorArea > 0 ? round((occupiedArea / containerFloorArea) * 100, 2) : 0,
    totalPlacedWeightKg: round(
      placements.reduce((sum: number, item: ContainerLoadPlanPlacement) => sum + item.weightKg, 0),
      3,
    ),
    totalPlacedUnits: placements.length,
  };
}

export function mapLoadPlanReasonToLabel(
  reason: ContainerLoadPlanUnplacedItem['reason'],
): string {
  if (reason === 'NO_FLOOR_SPACE') return 'Zeminde yer kalmadı';
  if (reason === 'HEIGHT_LIMIT') return 'Yükseklik limiti aşıldı';
  if (reason === 'INVALID_DIMENSIONS') return 'Geçersiz ölçü';
  if (reason === 'MISSING_STACK_BASE') return 'Alt istif tabanı bulunamadı';
  return reason;
}

export function buildLoadUnitsForPlacement(
  placement: ContainerLoadPlanPlacement,
  config?: LoadUnitPackingConfig,
): DebugPackedLayout {
  const unitsPerPallet =
    typeof config === 'object' && config !== null
      ? Math.max(1, toPositiveNumber(config.unitsPerPallet, 1))
      : Math.max(1, toPositiveNumber(config, 1));

  const unitsPerRow =
    typeof config === 'object' && config !== null
      ? Math.max(1, toPositiveNumber(config.unitsPerRow, unitsPerPallet))
      : unitsPerPallet;

  // ÖNEMLİ:
  // Palet üstü pattern konteyner içindeki döndürülmüş footprint'e göre değil,
  // fiziksel palet ölçüsüne göre hesaplanmalı.
  // Döndürme render tarafında uygulanacak.
  const physicalPalletWidthCm = Math.min(placement.widthCm, placement.lengthCm);
  const physicalPalletLengthCm = Math.max(placement.widthCm, placement.lengthCm);

  if (placement.shape === 'cylinder') {
    return fitDrumsOnPallet(
      physicalPalletWidthCm,
      physicalPalletLengthCm,
      unitsPerPallet,
      {
        id: placement.lotId,
        lotNumber: placement.lotNumber,
        productId: placement.productId,
        productName: placement.productName,
        productCode: placement.productCode,
        loadMaterialId: placement.loadMaterialId,
        loadMaterialCode: placement.loadMaterialCode,
        loadMaterialName: placement.loadMaterialName,
        loadMaterialType: placement.loadMaterialType,
        loadUnitWidthCm: placement.loadWidthCm,
        loadUnitLengthCm: placement.loadLengthCm,
        loadUnitHeightCm: placement.loadHeightCm,
        palletLines: [],
      },
    );
  }

  return fitBoxesOnPallet(
    physicalPalletWidthCm,
    physicalPalletLengthCm,
    unitsPerPallet,
    {
      id: placement.lotId,
      lotNumber: placement.lotNumber,
      productId: placement.productId,
      productName: placement.productName,
      productCode: placement.productCode,
      loadMaterialId: placement.loadMaterialId,
      loadMaterialCode: placement.loadMaterialCode,
      loadMaterialName: placement.loadMaterialName,
      loadMaterialType: placement.loadMaterialType,
      loadUnitWidthCm: placement.loadWidthCm,
      loadUnitLengthCm: placement.loadLengthCm,
      loadUnitHeightCm: placement.loadHeightCm,
      palletLines: [],
    },
    unitsPerRow,
    placement.loadHeightCm,
  );
}