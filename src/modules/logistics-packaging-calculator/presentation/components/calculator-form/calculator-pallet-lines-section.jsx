import { PalletLineEditor } from '../pallet-line-editor/pallet-line-editor';

export function CalculatorPalletLinesSection({
  lines,
  palletOptions,
  lineResults,
  sharedStackGroupOptions = [],
  invalidPalletLineIds = new Set(),
  invalidStackGroups = new Set(),
  onLineChange,
  onAddLine,
  onRemoveLine,
}) {
  const localStackGroups = lines
    .map((line) => line.stackGroup?.trim())
    .filter(Boolean);

  const stackGroupOptions = Array.from(
    new Set([...(sharedStackGroupOptions ?? []), ...localStackGroups]),
  ).sort((a, b) => a.localeCompare(b, 'tr'));

  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Palet Planı</h3>
          <p className="lp-section-heading__description">
            Aynı lot içinde birden fazla palet tipi ve istif grubu tanımlayabilirsiniz.
            İsterseniz başka lotlarda kullanılan ortak istif gruplarını da seçebilirsiniz.
          </p>
        </div>

        <button type="button" className="lp-button" onClick={onAddLine}>
          Palet Satırı Ekle
        </button>
      </div>

      <div className="lp-form-stack">
        {lines.map((line) => (
          <PalletLineEditor
            key={line.id}
            line={line}
            palletOptions={palletOptions}
            stackGroupOptions={stackGroupOptions}
            lineResult={lineResults.find((item) => item.lineId === line.id)}
            hasError={invalidPalletLineIds.has(line.id)}
            stackHasError={
              Boolean(line.stackGroup?.trim()) &&
              invalidStackGroups.has(line.stackGroup.trim())
            }
            onChange={onLineChange}
            onRemove={onRemoveLine}
            disableRemove={lines.length === 1}
          />
        ))}
      </div>
    </div>
  );
}