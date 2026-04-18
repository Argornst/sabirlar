import { mapCalculationResultToSummaryItems } from '../../../application';
import { LotSummary } from '../lot-summary/lot-summary';
import { StackSummary } from '../stack-summary/stack-summary';
import { CalculatorLotSection } from '../calculator-form/calculator-lot-section';
import { CalculatorContainerSection } from '../calculator-form/calculator-container-section';
import { CalculatorPalletLinesSection } from '../calculator-form/calculator-pallet-lines-section';
import { CalculatorStackSection } from '../calculator-form/calculator-stack-section';
import { CalculatorSummarySection } from '../calculator-form/calculator-summary-section';

export function ScenarioLotEditor({
  lot,
  lotIndex,
  result,
  materials,
  products,
  onChangeValues,
  onAddPalletLine,
  onRemovePalletLine,
}) {
  if (!lot || !result) {
    return (
      <section className="calculator-form">
        <div className="calculator-form__empty-state">
          Düzenlemek için bir lot seçin.
        </div>
      </section>
    );
  }

  const values = lot.values;
  const summaryItems = mapCalculationResultToSummaryItems(result);

  return (
    <div className="calculator-form">
      <LotSummary
        lotNumber={values.lotNumber?.trim() || `Lot ${lotIndex + 1}`}
        totalQuantityKg={result.totalQuantityKg}
        totalGrossWeightKg={result.totalGrossWeightKg}
        totalNetWeightKg={result.totalNetWeightKg}
        totalTareWeightKg={result.totalTareWeightKg}
        totalPalletCount={result.totalPalletCount}
        totalContainerCount={result.totalContainerCount}
        validationStatus={result.validationStatus}
      />

      <CalculatorLotSection
        values={values}
        products={products}
        onChange={(patch) =>
          onChangeValues((current) => ({
            ...current,
            ...patch,
          }))
        }
      />

      <CalculatorContainerSection
        values={values}
        materials={materials}
        onChange={(patch) =>
          onChangeValues((current) => ({
            ...current,
            ...patch,
          }))
        }
      />

      <CalculatorPalletLinesSection
        values={values}
        materials={materials}
        onChange={(nextPalletLines) =>
          onChangeValues((current) => ({
            ...current,
            palletLines: nextPalletLines,
          }))
        }
        onAddPalletLine={onAddPalletLine}
        onRemovePalletLine={onRemovePalletLine}
      />

      <CalculatorStackSection
        result={result}
        palletLines={values.palletLines}
      />

      <CalculatorSummarySection items={summaryItems} />

      <StackSummary stackSummaries={result.stackSummaries} />
    </div>
  );
}