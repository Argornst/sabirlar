import './calculator-form.css';
import { mapCalculationResultToSummaryItems } from '../../../application';
import { CalculatorContainerSection } from './calculator-container-section';
import { CalculatorLotSection } from './calculator-lot-section';
import { CalculatorPalletLinesSection } from './calculator-pallet-lines-section';
import { CalculatorStackSection } from './calculator-stack-section';
import { CalculatorSummarySection } from './calculator-summary-section';

function getNextSuggestedStackOrder(lines, lineId, stackGroup) {
  const normalized = stackGroup.trim();

  if (!normalized) {
    return 1;
  }

  const matchingOrders = lines
    .filter((line) => line.id !== lineId && line.stackGroup.trim() === normalized)
    .map((line) => (line.stackOrder === '' ? 1 : Number(line.stackOrder)))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!matchingOrders.length) {
    return 1;
  }

  const sortedUnique = Array.from(new Set(matchingOrders)).sort((a, b) => a - b);

  let expected = 1;
  for (const value of sortedUnique) {
    if (value !== expected) {
      return expected;
    }
    expected += 1;
  }

  return expected;
}

function getNextStackGroupName(lines) {
  const usedNumbers = lines
    .map((line) => line.stackGroup?.trim())
    .filter(Boolean)
    .map((group) => {
      const match = /^İstif-(\d+)$/i.exec(group);
      return match ? Number(match[1]) : null;
    })
    .filter((value) => Number.isFinite(value));

  if (!usedNumbers.length) {
    return 'İstif-1';
  }

  const sortedUnique = Array.from(new Set(usedNumbers)).sort((a, b) => a - b);

  let expected = 1;
  for (const value of sortedUnique) {
    if (value !== expected) {
      return `İstif-${expected}`;
    }
    expected += 1;
  }

  return `İstif-${expected}`;
}

export function CalculatorForm({
  values,
  result,
  products,
  materials,
  allowedMaterialIds,
  onChangeValues,
  onAddPalletLine,
  onRemovePalletLine,
  onSubmit,
  isSaving,
}) {
  const allowedSet = new Set(allowedMaterialIds ?? []);

  const filteredMaterials =
    allowedSet.size > 0
      ? materials.filter((item) => allowedSet.has(item.id))
      : materials;

  const palletOptions = filteredMaterials.filter((item) => item.materialType === 'PALLET');
  const containerOptions = filteredMaterials.filter(
    (item) => item.materialType === 'BOX' || item.materialType === 'DRUM',
  );
  const vacuumBagOptions = filteredMaterials.filter(
    (item) => item.materialType === 'VACUUM_BAG',
  );

  const summaryItems = mapCalculationResultToSummaryItems(result);

  const handleLineChange = (lineId, patch) => {
    onChangeValues((current) => ({
      ...current,
      palletLines: current.palletLines.map((line) => {
        if (line.id !== lineId) {
          return line;
        }

        const nextLine = {
          ...line,
          ...patch,
        };

        if (patch.createNextStackGroup) {
          const nextGroupName = getNextStackGroupName(current.palletLines);
          nextLine.stackGroup = nextGroupName;
          nextLine.stackOrder = getNextSuggestedStackOrder(
            current.palletLines,
            lineId,
            nextGroupName,
          );
          delete nextLine.createNextStackGroup;
          return nextLine;
        }

        const nextStackGroup =
          patch.stackGroup !== undefined ? patch.stackGroup : line.stackGroup;

        if (
          patch.stackGroup !== undefined &&
          nextStackGroup.trim() &&
          line.stackGroup.trim() !== nextStackGroup.trim()
        ) {
          nextLine.stackOrder = getNextSuggestedStackOrder(
            current.palletLines,
            lineId,
            nextStackGroup,
          );
        }

        if (patch.stackGroup !== undefined && !patch.stackGroup) {
          nextLine.stackOrder = 1;
        }

        return nextLine;
      }),
    }));
  };

  const updateRootValues = (patch) => {
    onChangeValues((current) => ({
      ...current,
      ...patch,
    }));
  };

  return (
    <form
      className="lp-calculator-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <CalculatorLotSection
        values={values}
        products={products}
        onChange={updateRootValues}
      />

      <CalculatorContainerSection
        values={values}
        containerOptions={containerOptions}
        vacuumBagOptions={vacuumBagOptions}
        onChange={updateRootValues}
      />

      <CalculatorPalletLinesSection
        lines={values.palletLines}
        palletOptions={palletOptions}
        lineResults={result.palletLineResults}
        onLineChange={handleLineChange}
        onAddLine={onAddPalletLine}
        onRemoveLine={onRemovePalletLine}
      />

      <CalculatorStackSection stacks={result.stackSummaries} />

      <CalculatorSummarySection summaryItems={summaryItems} result={result} />

      <div className="lp-form-actions">
        <button type="submit" className="lp-button" disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Hesaplamayı Kaydet'}
        </button>
      </div>
    </form>
  );
}