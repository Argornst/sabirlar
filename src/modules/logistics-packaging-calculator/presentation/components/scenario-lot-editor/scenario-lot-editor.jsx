import { useMemo, useState } from 'react';
import { CalculatorForm } from '../calculator-form/calculator-form';
import { CalculationResultCards } from '../calculation-result-cards/calculation-result-cards';
import { StackSummary } from '../stack-summary/stack-summary';
import { LotSummary } from '../lot-summary/lot-summary';
import './scenario-lot-editor.css';

const LOT_EDITOR_TABS = [
  { key: 'lot', label: 'Lot Bilgisi' },
  { key: 'summary', label: 'Özet' },
  { key: 'stack', label: 'İstif' },
];

function resolveSelectedLot(lots = [], selectedLotId) {
  if (!lots.length) return null;
  return lots.find((lot) => lot.id === selectedLotId) ?? lots[0];
}

function buildFallbackStackSummaries(palletLines = [], materials = []) {
  const grouped = new Map();

  palletLines.forEach((line) => {
    const stackGroup = String(line.stackGroup ?? '').trim();
    if (!stackGroup) return;

    const current = grouped.get(stackGroup) ?? [];
    current.push(line);
    grouped.set(stackGroup, current);
  });

  return Array.from(grouped.entries()).map(([stackGroup, lines]) => {
    const sortedLines = [...lines].sort(
      (a, b) => Number(a.stackOrder ?? 1) - Number(b.stackOrder ?? 1),
    );

    const totalPalletCount = sortedLines.reduce(
      (sum, line) => sum + Number(line.palletCount ?? 0),
      0,
    );

    const totalHeightCm = sortedLines.reduce((sum, line) => {
      const palletMaterial = materials.find((item) => item.id === line.palletMaterialId);
      const palletHeightCm = Number(palletMaterial?.heightCm ?? 0);
      return sum + palletHeightCm;
    }, 0);

    return {
      stackGroup,
      palletCount: totalPalletCount,
      palletTotal: totalPalletCount,
      totalHeightCm,
      items: sortedLines.map((line) => ({
        palletLineId: line.id,
        palletCount: Number(line.palletCount ?? 0),
        stackOrder: Number(line.stackOrder ?? 1),
      })),
    };
  });
}

function getWarningMessages(result) {
  return (result?.validationMessages ?? []).filter(
    (message) => message.level === 'WARNING',
  );
}

export function ScenarioLotEditor({
  scenario,
  selectedLotId,
  setSelectedLotId,
  lotResult,
  aggregateResult,
  products = [],
  materials = [],
  onUpdateLotValues,
  onAddPalletLine,
  onRemovePalletLine,
}) {
  const [activeTab, setActiveTab] = useState('lot');

  const selectedLot = resolveSelectedLot(scenario?.values?.lots ?? [], selectedLotId);

  const selectedIndex = useMemo(() => {
    if (!selectedLot) return 0;
    return scenario.values.lots.findIndex((lot) => lot.id === selectedLot.id) + 1;
  }, [scenario.values.lots, selectedLot]);

  const sharedStackGroupOptions = useMemo(() => {
    return Array.from(
      new Set(
        (selectedLot?.values?.palletLines ?? [])
          .map((line) => String(line.stackGroup ?? '').trim())
          .filter(Boolean),
      ),
    );
  }, [selectedLot]);

  const effectiveStackSummaries = useMemo(() => {
    const fromResult = lotResult?.stackSummaries ?? [];
    if (fromResult.length > 0) return fromResult;

    return buildFallbackStackSummaries(
      selectedLot?.values?.palletLines ?? [],
      materials,
    );
  }, [lotResult?.stackSummaries, selectedLot?.values?.palletLines, materials]);

  const warningMessages = useMemo(
    () => getWarningMessages(lotResult),
    [lotResult],
  );

  if (!selectedLot) {
    return (
      <section className="lp-lot-editor">
        <div className="lp-empty-state">Düzenlenecek lot bulunamadı.</div>
      </section>
    );
  }

  const handleSetValues = (nextValuesOrUpdater) => {
    onUpdateLotValues(selectedLot.id, nextValuesOrUpdater);
  };

  const handleAddPalletLine = (preferredPalletId = '') => {
    onAddPalletLine(selectedLot.id, preferredPalletId);
  };

  const handleRemovePalletLine = (lineId) => {
    onRemovePalletLine(selectedLot.id, lineId);
  };

  const sharedFormProps = {
    values: selectedLot.values,
    onChangeValues: handleSetValues,
    result: lotResult,
    products,
    materials,
    sharedStackGroupOptions,
    onAddPalletLine: handleAddPalletLine,
    onRemovePalletLine: handleRemovePalletLine,
    hideSubmit: true,
  };

  return (
    <section className="lp-lot-editor">
      <div className="lp-lot-editor__header">
        <div>
          <div className="lp-lot-editor__eyebrow">
            <span>Seçili Lot</span>
            <strong>#{selectedIndex}</strong>
          </div>

          <h3 className="lp-lot-editor__title">
            {selectedLot.values.lotNumber?.trim() || `Lot ${selectedIndex}`}
          </h3>

          <p className="lp-lot-editor__description">
            Bu lotu düzenleyin. Başka lot seçtiğinizde bu alan otomatik güncellenir.
          </p>
        </div>

        <div className="lp-lot-editor__quick-summary">
          <div className="lp-lot-editor__quick-summary-item">
            <span>Net</span>
            <strong>{lotResult?.totalNetWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
          </div>

          <div className="lp-lot-editor__quick-summary-item">
            <span>Brüt</span>
            <strong>{lotResult?.totalGrossWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
          </div>

          <div className="lp-lot-editor__quick-summary-item">
            <span>Palet</span>
            <strong>{lotResult?.totalPalletCount ?? 0}</strong>
          </div>
        </div>
      </div>

      {warningMessages.length > 0 ? (
        <div className="lp-lot-editor__warnings">
          {warningMessages.slice(0, 3).map((message, index) => (
            <div
              key={`${message.code}-${message.message}-${index}`}
              className="lp-lot-editor__warning-item"
            >
              <strong>Uyarı</strong>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="lp-lot-editor__tabs">
        {LOT_EDITOR_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`lp-lot-editor__tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="lp-lot-editor__content">
        {activeTab === 'lot' ? (
          <div className="lp-panel lp-lot-editor__form-card">
            <div className="lp-section-heading">
              <div>
                <h4 className="lp-section-heading__title">Lot Bilgileri</h4>
                <p className="lp-section-heading__description">
                  Ürün, lot numarası, miktar, ambalaj ve palet planını tek yerde yönetin.
                </p>
              </div>
            </div>

            <CalculatorForm
              {...sharedFormProps}
              sections={['lot', 'container', 'pallet']}
            />
          </div>
        ) : null}

        {activeTab === 'summary' ? (
          <div className="lp-lot-editor__summary-stack">
            <div className="lp-panel">
              <div className="lp-section-heading">
                <div>
                  <h4 className="lp-section-heading__title">Lot Özeti</h4>
                  <p className="lp-section-heading__description">
                    Seçili lot için hesaplanan ana çıktılar.
                  </p>
                </div>
              </div>

              <LotSummary
                values={selectedLot.values}
                result={lotResult}
                products={products}
              />
            </div>

            <div className="lp-panel">
              <div className="lp-section-heading">
                <div>
                  <h4 className="lp-section-heading__title">Sonuç Kartları</h4>
                  <p className="lp-section-heading__description">
                    Net, brüt, palet ve doğrulama bilgileri.
                  </p>
                </div>
              </div>

              <CalculationResultCards result={lotResult} />
            </div>
          </div>
        ) : null}

        {activeTab === 'stack' ? (
          <div className="lp-panel">
            <div className="lp-section-heading">
              <div>
                <h4 className="lp-section-heading__title">İstif Özeti</h4>
                <p className="lp-section-heading__description">
                  Seçili lot için istif grupları ve kat bilgileri.
                </p>
              </div>
            </div>

            <StackSummary stackSummaries={effectiveStackSummaries} />
          </div>
        ) : null}
      </div>
    </section>
  );
}