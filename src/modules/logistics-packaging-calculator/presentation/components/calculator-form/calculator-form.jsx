import './calculator-form.css';
import { mapCalculationResultToSummaryItems } from '../../../application';
import { CalculatorContainerSection } from './calculator-container-section';
import { CalculatorLotSection } from './calculator-lot-section';
import { CalculatorPalletLinesSection } from './calculator-pallet-lines-section';
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

function getNextStackGroupName(stackGroupOptions = []) {
  const usedNumbers = stackGroupOptions
    .map((group) => String(group ?? '').trim())
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

function getValidationMap(result) {
  const messages = result?.validationMessages ?? [];

  return messages.reduce(
    (acc, message) => {
      if (message.palletLineId) {
        acc.palletLineIds.add(message.palletLineId);
      }

      if (message.stackGroup) {
        acc.stackGroups.add(message.stackGroup);
      }

      if (!message.palletLineId && !message.stackGroup) {
        acc.hasGeneralError = true;
      }

      return acc;
    },
    {
      palletLineIds: new Set(),
      stackGroups: new Set(),
      hasGeneralError: false,
    },
  );
}

function CompactStackPreview({ stacks = [] }) {
  if (!stacks.length) {
    return null;
  }

  return (
    <div className="lp-panel lp-compact-stack-preview">
      <div className="lp-compact-stack-preview__header">
        <div>
          <h3>İstif Kısa Özeti</h3>
          <p>Lot içindeki istif bilgileri küçük kartlar halinde gösterilir.</p>
        </div>
      </div>

      <div className="lp-compact-stack-preview__grid">
        {stacks.map((stack) => (
          <div
            key={stack.stackGroup}
            className={`lp-compact-stack-preview__card ${
              stack.exceedsStackHeightLimit ? 'is-warning' : 'is-valid'
            }`}
          >
            <div className="lp-compact-stack-preview__card-top">
              <strong>{stack.stackGroup}</strong>
              <span>
                {stack.exceedsStackHeightLimit ? 'Limit Aşıldı' : 'Uygun'}
              </span>
            </div>

            <div className="lp-compact-stack-preview__card-metrics">
              <div>
                <small>Yükseklik</small>
                <b>{Number(stack.totalHeightCm ?? 0).toFixed(2)} cm</b>
              </div>
              <div>
                <small>Brüt</small>
                <b>{Number(stack.totalGrossWeightKg ?? 0).toFixed(3)} kg</b>
              </div>
              <div>
                <small>Zemin</small>
                <b>{stack.groundPalletCount}</b>
              </div>
              <div>
                <small>Satır</small>
                <b>{stack.palletLineIds?.length ?? 0}</b>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculatorForm({
  values,
  result,
  products,
  materials,
  allowedMaterialIds,
  sharedStackGroupOptions = [],
  onChangeValues,
  onAddPalletLine,
  onRemovePalletLine,
  onSubmit,
  isSaving,
  hideSubmit = false,
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
  const validationMap = getValidationMap(result);

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
          const nextGroupName = getNextStackGroupName(sharedStackGroupOptions);
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
        hasError={validationMap.hasGeneralError}
      />

      <CalculatorContainerSection
        values={values}
        containerOptions={containerOptions}
        vacuumBagOptions={vacuumBagOptions}
        onChange={updateRootValues}
        hasError={validationMap.hasGeneralError}
      />

      <CalculatorPalletLinesSection
        lines={values.palletLines}
        palletOptions={palletOptions}
        lineResults={result.palletLineResults}
        sharedStackGroupOptions={sharedStackGroupOptions}
        invalidPalletLineIds={validationMap.palletLineIds}
        invalidStackGroups={validationMap.stackGroups}
        onLineChange={handleLineChange}
        onAddLine={onAddPalletLine}
        onRemoveLine={onRemovePalletLine}
      />

      <CompactStackPreview stacks={result.stackSummaries} />

      <CalculatorSummarySection summaryItems={summaryItems} result={result} />

      {!hideSubmit ? (
        <div className="lp-form-actions">
          <button type="submit" className="lp-button" disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Hesaplamayı Kaydet'}
          </button>
        </div>
      ) : null}
    </form>
  );
}