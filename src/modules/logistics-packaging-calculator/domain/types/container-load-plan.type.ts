export const CONTAINER_TYPES = {
  '20DC': {
    key: '20DC',
    label: '20 DC',
    innerLengthCm: 589,
    innerWidthCm: 235,
    innerHeightCm: 239,
    maxPayloadKg: 28200,
  },
  '40HC': {
    key: '40HC',
    label: '40 HC',
    innerLengthCm: 1203,
    innerWidthCm: 235,
    innerHeightCm: 269,
    maxPayloadKg: 28600,
  },
} as const;

export type ContainerTypeKey = keyof typeof CONTAINER_TYPES;

export interface ContainerDimensions {
  key?: ContainerTypeKey;
  label?: string;
  innerLengthCm: number;
  innerWidthCm: number;
  innerHeightCm: number;
  maxPayloadKg?: number;
}

export interface ContainerLoadPlanLotInputPalletLine {
  id: string;
  palletMaterialId: string;
  palletMaterialCode?: string;
  palletMaterialName?: string;
  palletWidthCm?: number | null;
  palletLengthCm?: number | null;
  palletHeightCm?: number | null;
  palletCount: number | string;
  unitsPerPallet?: number | string;
  stackGroup?: string;
  stackOrder?: number | string;
  palletGrossWeightKg?: number | null;
  totalLineGrossWeightKg?: number | null;
}

export interface ContainerLoadPlanLotInput {
  id: string;
  lotNumber: string;
  productId: string;
  productName?: string;
  productCode?: string;

  loadMaterialId?: string;
  loadMaterialCode?: string;
  loadMaterialName?: string;
  loadMaterialType?: string;
  loadUnitWidthCm?: number | null;
  loadUnitLengthCm?: number | null;
  loadUnitHeightCm?: number | null;

  palletLines: ContainerLoadPlanLotInputPalletLine[];
}

export interface ContainerLoadPlanPlacement {
  id: string;
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  productCode: string;

  palletLineId: string;

  palletMaterialId: string;
  palletMaterialCode: string;
  palletMaterialName: string;

  loadMaterialId: string;
  loadMaterialCode: string;
  loadMaterialName: string;
  loadMaterialType: string;

  shape: 'box' | 'cylinder';
  color: string;

  xCm: number;
  yCm: number;
  zCm: number;

  widthCm: number;
  lengthCm: number;
  heightCm: number;

  palletBaseHeightCm: number;
  loadWidthCm: number;
  loadLengthCm: number;
  loadHeightCm: number;

  weightKg: number;
  stackGroup: string | null;
  stackOrder: number;
  rotated: boolean;
  footprintAreaCm2: number;
}

export interface ContainerLoadPlanUnplacedItem {
  id: string;
  lotId: string;
  lotNumber: string;
  palletLineId: string;
  palletMaterialCode: string;
  reason: 'NO_FLOOR_SPACE' | 'HEIGHT_LIMIT' | 'INVALID_DIMENSIONS' | 'MISSING_STACK_BASE';
  widthCm: number;
  lengthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface ContainerLoadPlanBalanceSummary {
  totalWeightKg: number;
  leftWeightKg: number;
  rightWeightKg: number;
  frontWeightKg: number;
  rearWeightKg: number;
  leftRightDeltaKg: number;
  frontRearDeltaKg: number;
}

export interface ContainerLoadPlanLegendItem {
  lotId: string;
  lotNumber: string;
  label: string;
  color: string;
}

export interface ContainerLoadPlan {
  container: ContainerDimensions;
  placements: ContainerLoadPlanPlacement[];
  unplaced: ContainerLoadPlanUnplacedItem[];
  legend: ContainerLoadPlanLegendItem[];
  balance: ContainerLoadPlanBalanceSummary;
  occupancyPercent: number;
  totalPlacedWeightKg: number;
  totalPlacedUnits: number;
}