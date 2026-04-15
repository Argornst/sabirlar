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
  diameterCm?: number;
  widthCm?: number;
  lengthCm?: number;
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
    .filter((item) => item.xCm + item.widthCm / 2 <= halfWidth)
    .reduce((sum, item) => sum + item.weightKg, 0);

  const rightWeightKg = placements
    .filter((item) => item.xCm + item.widthCm / 2 > halfWidth)
    .reduce((sum, item) => sum + item.weightKg, 0);

  const frontWeightKg = placements
    .filter((item) => item.zCm + item.lengthCm / 2 <= halfLength)
    .reduce((sum, item) => sum + item.weightKg, 0);

  const rearWeightKg = placements
    .filter((item) => item.zCm + item.lengthCm / 2 > halfLength)
    .reduce((sum, item) => sum + item.weightKg, 0);

  const totalWeightKg = round(
    placements.reduce((sum, item) => sum + item.weightKg, 0),
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

function canPlaceAt(
  candidate: {
    xCm: number;
    zCm: number;
    widthCm: number;
    lengthCm: number;
    totalHeightCm: number;
  },
  placedOnFloor: ContainerLoadPlanPlacement[],
  container: ContainerDimensions,
): boolean {
  if (candidate.xCm + candidate.widthCm > container.innerWidthCm) {
    return false;
  }

  if (candidate.zCm + candidate.lengthCm > container.innerLengthCm) {
    return false;
  }

  if (candidate.totalHeightCm > container.innerHeightCm) {
    return false;
  }

  return !placedOnFloor.some((existing) => {
    const separatedX =
      candidate.xCm + candidate.widthCm <= existing.xCm ||
      existing.xCm + existing.widthCm <= candidate.xCm;

    const separatedZ =
      candidate.zCm + candidate.lengthCm <= existing.zCm ||
      existing.zCm + existing.lengthCm <= candidate.zCm;

    return !(separatedX || separatedZ);
  });
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

  let best: DebugPackedLayout | null = null;

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
              diameterCm: round(diameter, 2),
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
              diameterCm: round(diameter, 2),
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

  best = {
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
        diameterCm: round(Math.min(diameter, Math.min(palletWidthCm, palletLengthCm) - 4), 2),
      },
    ],
  };

  return best;
}

function fitBoxesOnPallet(
  palletWidthCm: number,
  palletLengthCm: number,
  unitCount: number,
  lot: ContainerLoadPlanLotInput,
): DebugPackedLayout {
  const boxWidth = toPositiveNumber(
    lot.loadUnitWidthCm,
    Math.max(18, palletWidthCm * 0.3),
  );
  const boxLength = toPositiveNumber(
    lot.loadUnitLengthCm,
    Math.max(18, palletLengthCm * 0.3),
  );

  const candidateGaps = [6, 4, 2, 1, 0];

  for (const gap of candidateGaps) {
    const cols = Math.max(1, Math.floor((palletWidthCm + gap) / (boxWidth + gap)));
    const rows = Math.max(1, Math.floor((palletLengthCm + gap) / (boxLength + gap)));

    if (cols * rows < unitCount) {
      continue;
    }

    const requiredWidth = cols * boxWidth + (cols - 1) * gap;
    const requiredLength = rows * boxLength + (rows - 1) * gap;
    const startX = (palletWidthCm - requiredWidth) / 2 + boxWidth / 2;
    const startZ = (palletLengthCm - requiredLength) / 2 + boxLength / 2;

    const placements: LoadUnitPlacement[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (placements.length >= unitCount) {
          break;
        }

        placements.push({
          xOffsetCm: round(startX + col * (boxWidth + gap), 2),
          zOffsetCm: round(startZ + row * (boxLength + gap), 2),
          widthCm: round(boxWidth, 2),
          lengthCm: round(boxLength, 2),
        });
      }
    }

    return {
      kind: 'box',
      palletWidthCm,
      palletLengthCm,
      unitCount,
      unitWidthCm: round(boxWidth, 2),
      unitLengthCm: round(boxLength, 2),
      chosenGapCm: gap,
      rows,
      cols,
      axis: 'row-major',
      placements,
    };
  }

  return {
    kind: 'box',
    palletWidthCm,
    palletLengthCm,
    unitCount,
    unitWidthCm: round(Math.min(boxWidth, palletWidthCm - 4), 2),
    unitLengthCm: round(Math.min(boxLength, palletLengthCm - 4), 2),
    chosenGapCm: 0,
    rows: 1,
    cols: 1,
    axis: 'single',
    placements: [
      {
        xOffsetCm: round(palletWidthCm / 2, 2),
        zOffsetCm: round(palletLengthCm / 2, 2),
        widthCm: round(Math.min(boxWidth, palletWidthCm - 4), 2),
        lengthCm: round(Math.min(boxLength, palletLengthCm - 4), 2),
      },
    ],
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

export function buildContainerLoadPlan({
  lots,
  container,
}: BuildContainerLoadPlanParams): ContainerLoadPlan {
  const placements: ContainerLoadPlanPlacement[] = [];
  const unplaced: ContainerLoadPlanUnplacedItem[] = [];
  const legend = buildLegend(lots);
  const colorByLotId = new Map(legend.map((item) => [item.lotId, item.color]));
  const floorPlaced: ContainerLoadPlanPlacement[] = [];
  const stackSlotsByGroup = new Map<string, StackBaseSlot[]>();

  let cursorX = 0;
  let cursorZ = 0;
  let rowDepth = 0;

  lots.forEach((lot, lotIndex) => {
    lot.palletLines.forEach((line) => {
      const palletCount = toPositiveNumber(line.palletCount, 1);
      const footprint = getDefaultFootprint(lot);
      const baseWidth = toPositiveNumber(line.palletWidthCm, footprint.widthCm);
      const baseLength = toPositiveNumber(line.palletLengthCm, footprint.lengthCm);
      const baseHeight = getTotalPlacementHeightCm(lot, line);
      const baseWeight = getPlacementWeight(line);
      const stackGroup = line.stackGroup?.trim() || null;
      const stackOrder = toPositiveNumber(line.stackOrder, 1);
      const lotColor = colorByLotId.get(lot.id) || getLotColor(lotIndex);

      if (baseWidth <= 0 || baseLength <= 0 || baseHeight <= 0) {
        unplaced.push({
          id: `${lot.id}:${line.id}:invalid`,
          lotId: lot.id,
          lotNumber: lot.lotNumber || `Lot ${lotIndex + 1}`,
          palletLineId: line.id,
          palletMaterialCode: line.palletMaterialCode || line.palletMaterialName || '-',
          reason: 'INVALID_DIMENSIONS',
          widthCm: baseWidth,
          lengthCm: baseLength,
          heightCm: baseHeight,
          weightKg: baseWeight,
        });
        return;
      }

      if (stackGroup && stackOrder > 1) {
        const slots = stackSlotsByGroup.get(stackGroup) ?? [];

        if (slots.length === 0) {
          for (let i = 0; i < palletCount; i += 1) {
            unplaced.push({
              id: `${lot.id}:${line.id}:${i + 1}`,
              lotId: lot.id,
              lotNumber: lot.lotNumber || `Lot ${lotIndex + 1}`,
              palletLineId: line.id,
              palletMaterialCode: line.palletMaterialCode || line.palletMaterialName || '-',
              reason: 'MISSING_STACK_BASE',
              widthCm: baseWidth,
              lengthCm: baseLength,
              heightCm: baseHeight,
              weightKg: baseWeight,
            });
          }
          return;
        }

        for (let i = 0; i < palletCount; i += 1) {
          const slot = slots[i % slots.length];
          const placementId = `${lot.id}:${line.id}:${i + 1}`;

          if (slot.baseTopYForNextLevelCm + baseHeight > container.innerHeightCm) {
            unplaced.push({
              id: placementId,
              lotId: lot.id,
              lotNumber: lot.lotNumber || `Lot ${lotIndex + 1}`,
              palletLineId: line.id,
              palletMaterialCode: line.palletMaterialCode || line.palletMaterialName || '-',
              reason: 'HEIGHT_LIMIT',
              widthCm: slot.widthCm,
              lengthCm: slot.lengthCm,
              heightCm: baseHeight,
              weightKg: baseWeight,
            });
            continue;
          }

          const placement = createPlacement({
            placementId,
            lot,
            line,
            lotColor,
            xCm: slot.xCm,
            yCm: slot.baseTopYForNextLevelCm,
            zCm: slot.zCm,
            widthCm: slot.widthCm,
            lengthCm: slot.lengthCm,
            rotated: slot.rotated,
            stackGroup,
            stackOrder,
          });

          placements.push(placement);
          slot.baseTopYForNextLevelCm += placement.heightCm;
        }

        return;
      }

      const currentGroupSlots: StackBaseSlot[] = [];

      for (let i = 0; i < palletCount; i += 1) {
        const placementId = `${lot.id}:${line.id}:${i + 1}`;

        let chosenWidth = baseWidth;
        let chosenLength = baseLength;
        let rotated = false;

        let candidate = {
          xCm: cursorX,
          zCm: cursorZ,
          widthCm: chosenWidth,
          lengthCm: chosenLength,
          totalHeightCm: baseHeight,
        };

        if (!canPlaceAt(candidate, floorPlaced, container)) {
          const rotatedCandidate = {
            xCm: cursorX,
            zCm: cursorZ,
            widthCm: baseLength,
            lengthCm: baseWidth,
            totalHeightCm: baseHeight,
          };

          if (canPlaceAt(rotatedCandidate, floorPlaced, container)) {
            chosenWidth = baseLength;
            chosenLength = baseWidth;
            rotated = true;
            candidate = rotatedCandidate;
          } else {
            cursorX = 0;
            cursorZ += rowDepth;
            rowDepth = 0;

            candidate = {
              xCm: cursorX,
              zCm: cursorZ,
              widthCm: chosenWidth,
              lengthCm: chosenLength,
              totalHeightCm: baseHeight,
            };

            if (!canPlaceAt(candidate, floorPlaced, container)) {
              const rotatedNextRowCandidate = {
                xCm: cursorX,
                zCm: cursorZ,
                widthCm: baseLength,
                lengthCm: baseWidth,
                totalHeightCm: baseHeight,
              };

              if (canPlaceAt(rotatedNextRowCandidate, floorPlaced, container)) {
                chosenWidth = baseLength;
                chosenLength = baseWidth;
                rotated = true;
                candidate = rotatedNextRowCandidate;
              } else {
                unplaced.push({
                  id: placementId,
                  lotId: lot.id,
                  lotNumber: lot.lotNumber || `Lot ${lotIndex + 1}`,
                  palletLineId: line.id,
                  palletMaterialCode: line.palletMaterialCode || line.palletMaterialName || '-',
                  reason: 'NO_FLOOR_SPACE',
                  widthCm: baseWidth,
                  lengthCm: baseLength,
                  heightCm: baseHeight,
                  weightKg: baseWeight,
                });
                continue;
              }
            }
          }
        }

        const placement = createPlacement({
          placementId,
          lot,
          line,
          lotColor,
          xCm: candidate.xCm,
          yCm: 0,
          zCm: candidate.zCm,
          widthCm: chosenWidth,
          lengthCm: chosenLength,
          rotated,
          stackGroup,
          stackOrder,
        });

        placements.push(placement);
        floorPlaced.push(placement);

        currentGroupSlots.push({
          xCm: placement.xCm,
          zCm: placement.zCm,
          widthCm: placement.widthCm,
          lengthCm: placement.lengthCm,
          baseTopYForNextLevelCm: placement.heightCm,
          rotated: placement.rotated,
        });

        cursorX += chosenWidth;
        rowDepth = Math.max(rowDepth, chosenLength);
      }

      if (stackGroup && currentGroupSlots.length > 0) {
        stackSlotsByGroup.set(stackGroup, currentGroupSlots);
      }
    });
  });

  const containerFloorArea = container.innerWidthCm * container.innerLengthCm;
  const occupiedArea = floorPlaced.reduce(
    (sum, item) => sum + item.widthCm * item.lengthCm,
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
      placements.reduce((sum, item) => sum + item.weightKg, 0),
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
  unitsPerPalletRaw?: number | string | null,
) {
  const unitsPerPallet = Math.max(1, toPositiveNumber(unitsPerPalletRaw, 1));

  const packed =
    placement.shape === 'cylinder'
      ? fitDrumsOnPallet(
          placement.widthCm,
          placement.lengthCm,
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
        )
      : fitBoxesOnPallet(
          placement.widthCm,
          placement.lengthCm,
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

  return packed;
}