import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  mapAggregateResultToSummaryItems,
  useCreatePackagingScenarioMutation,
  useDeletePackagingScenarioMutation,
  usePackagingMaterialsQuery,
  usePackagingProductsQuery,
  usePackagingRulesQuery,
  usePackagingScenarioCalculator,
  usePackagingScenariosQuery,
} from '../../application';
import { SupabasePackagingMaterialsRepository } from '../../infrastructure/repositories/supabase-packaging-materials.repository.js';
import { SupabasePackagingProductsRepository } from '../../infrastructure/repositories/supabase-packaging-products.repository.js';
import { SupabasePackagingRulesRepository } from '../../infrastructure/repositories/supabase-packaging-rules.repository.js';
import { SupabasePackagingScenariosRepository } from '../../infrastructure/repositories/supabase-packaging-scenarios.repository.js';
import { CalculatorForm } from '../components/calculator-form/calculator-form';
import { CalculationResultCards } from '../components/calculation-result-cards/calculation-result-cards';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';
import { ScenarioHistory } from '../components/scenario-history/scenario-history';
import { StackSummary } from '../components/stack-summary/stack-summary';
import { LotSummary } from '../components/lot-summary/lot-summary';
import './logistics-packaging-calculator-page.css';

const productsRepository = new SupabasePackagingProductsRepository();
const materialsRepository = new SupabasePackagingMaterialsRepository();
const rulesRepository = new SupabasePackagingRulesRepository();
const scenariosRepository = new SupabasePackagingScenariosRepository();

function pickPreferredMaterial(materials, rules) {
  if (!materials.length) return '';
  if (!rules.length) return materials[0]?.id ?? '';

  const requiredIds = new Set(
    rules.filter((rule) => rule.isRequired).map((rule) => rule.materialId),
  );

  const requiredMatch = materials.find((item) => requiredIds.has(item.id));
  return requiredMatch?.id ?? materials[0]?.id ?? '';
}

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function getStatusClass(status) {
  if (status === 'INVALID') return 'is-invalid';
  if (status === 'WARNING') return 'is-warning';
  return '';
}

function createDefaultPalletLine() {
  return {
    id: crypto.randomUUID(),
    palletMaterialId: '',
    palletCount: 1,
    unitsPerRow: '',
    unitsPerPallet: '',
    stackGroup: '',
    stackOrder: 1,
  };
}

function mapScenarioHistoryItemToFormValues(item) {
  return {
    name: item.scenario.name || '',
    lots: item.lots.map((lotWrapper) => ({
      id: crypto.randomUUID(),
      values: {
        lotNumber: lotWrapper.lot.lotNumber || '',
        productId: lotWrapper.lot.productId || '',
        totalQuantityKg:
          lotWrapper.lot.totalQuantityKg == null
            ? ''
            : Number(lotWrapper.lot.totalQuantityKg),
        containerMaterialId: lotWrapper.lot.containerMaterialId || '',
        vacuumBagMaterialId: lotWrapper.lot.vacuumBagMaterialId || null,
        unitNetWeightKg:
          lotWrapper.lot.unitNetWeightKg == null
            ? ''
            : Number(lotWrapper.lot.unitNetWeightKg),
        notes: lotWrapper.lot.notes || '',
        palletLines:
          lotWrapper.palletLines.length > 0
            ? lotWrapper.palletLines.map((line) => ({
                id: crypto.randomUUID(),
                palletMaterialId: line.palletMaterialId || '',
                palletCount: line.palletCount ?? 1,
                unitsPerRow: line.unitsPerRow ?? '',
                unitsPerPallet: line.unitsPerPallet ?? '',
                stackGroup: line.stackGroup || '',
                stackOrder: line.stackOrder ?? 1,
              }))
            : [createDefaultPalletLine()],
      },
    })),
  };
}

function mapScenarioHistoryItemToDuplicatedFormValues(item) {
  const base = mapScenarioHistoryItemToFormValues(item);

  return {
    ...base,
    name: base.name ? `${base.name} (Kopya)` : 'Kopya Senaryo',
  };
}

export function LogisticsPackagingCalculatorPage() {
  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const rulesQuery = usePackagingRulesQuery(rulesRepository);
  const scenariosQuery = usePackagingScenariosQuery(scenariosRepository);

  const products = productsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];
  const allRules = rulesQuery.data ?? [];
  const scenarios = scenariosQuery.data ?? [];

  const scenario = usePackagingScenarioCalculator({
    materials,
    productRules: allRules,
  });

  const createScenarioMutation = useCreatePackagingScenarioMutation({
    scenariosRepository,
    materials,
    productRules: allRules,
  });

  const deleteScenarioMutation = useDeletePackagingScenarioMutation(
    scenariosRepository,
  );

  const [focusedProblemLotId, setFocusedProblemLotId] = useState(null);

  const isLoading =
    productsQuery.isLoading ||
    materialsQuery.isLoading ||
    rulesQuery.isLoading ||
    scenariosQuery.isLoading;

  const isSaving = createScenarioMutation.isPending;

  const sharedStackGroupOptions = useMemo(() => {
    return Array.from(
      new Set(
        scenario.values.lots.flatMap((lot) =>
          lot.values.palletLines
            .map((line) => line.stackGroup?.trim())
            .filter(Boolean),
        ),
      ),
    ).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [scenario.values.lots]);

  useEffect(() => {
    scenario.values.lots.forEach((lot) => {
      const lotRules = allRules.filter(
        (rule) => rule.productId === lot.values.productId,
      );

      const allowedMaterialIds = lotRules.map((rule) => rule.materialId);
      const allowedSet = new Set(allowedMaterialIds);

      const allowedMaterials =
        allowedSet.size > 0
          ? materials.filter((item) => allowedSet.has(item.id))
          : materials;

      const allowedContainers = allowedMaterials.filter(
        (item) => item.materialType === 'BOX' || item.materialType === 'DRUM',
      );
      const allowedVacuumBags = allowedMaterials.filter(
        (item) => item.materialType === 'VACUUM_BAG',
      );
      const allowedPallets = allowedMaterials.filter(
        (item) => item.materialType === 'PALLET',
      );

      const preferredContainerId = pickPreferredMaterial(allowedContainers, lotRules);
      const preferredVacuumBagId = pickPreferredMaterial(allowedVacuumBags, lotRules);
      const preferredPalletId = pickPreferredMaterial(allowedPallets, lotRules);

      let hasChanges = false;

      const nextPalletLines = lot.values.palletLines.map((line) => {
        if (!lot.values.productId) {
          return line;
        }

        if (!line.palletMaterialId && preferredPalletId) {
          hasChanges = true;
          return {
            ...line,
            palletMaterialId: preferredPalletId,
          };
        }

        return line;
      });

      if (
        lot.values.productId &&
        (!lot.values.containerMaterialId ||
          (preferredContainerId &&
            lot.values.containerMaterialId !== preferredContainerId &&
            !allowedSet.has(lot.values.containerMaterialId)))
      ) {
        hasChanges = true;
      }

      if (
        lot.values.productId &&
        lot.values.vacuumBagMaterialId == null &&
        preferredVacuumBagId
      ) {
        hasChanges = true;
      }

      if (hasChanges) {
        scenario.updateLotValues(lot.id, (current) => ({
          ...current,
          containerMaterialId:
            current.containerMaterialId && allowedSet.has(current.containerMaterialId)
              ? current.containerMaterialId
              : preferredContainerId || current.containerMaterialId,
          vacuumBagMaterialId:
            current.vacuumBagMaterialId == null && preferredVacuumBagId
              ? preferredVacuumBagId
              : current.vacuumBagMaterialId,
          palletLines: nextPalletLines,
        }));
      }
    });
  }, [allRules, materials, scenario]);

  const handleSaveScenario = async () => {
    const lotStatuses = scenario.values.lots.map((lot) => ({
      lotId: lot.id,
      status: scenario.getLotResult(lot.id).validationStatus,
    }));

    const firstInvalidLot = lotStatuses.find((item) => item.status === 'INVALID');

    if (firstInvalidLot) {
      setFocusedProblemLotId(firstInvalidLot.lotId);

      requestAnimationFrame(() => {
        const element = document.getElementById(
          `lp-scenario-lot-card-${firstInvalidLot.lotId}`,
        );

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });

      window.setTimeout(() => {
        setFocusedProblemLotId((current) =>
          current === firstInvalidLot.lotId ? null : current,
        );
      }, 2200);

      toast.error('Kaydetmeden önce hatalı lotu düzeltin.');
      return;
    }

    try {
      await createScenarioMutation.mutateAsync({
        values: scenario.values,
      });

      toast.success('Paketleme senaryosu kaydedildi.');
      scenario.reset();
      setFocusedProblemLotId(null);
    } catch (error) {
      toast.error(error?.message || 'Kayıt sırasında hata oluştu.');
    }
  };

  const handleLoadScenario = (historyItem) => {
    scenario.loadScenario(mapScenarioHistoryItemToFormValues(historyItem));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFocusedProblemLotId(null);
    toast.success('Senaryo forma yüklendi.');
  };

  const handleDuplicateScenario = (historyItem) => {
    scenario.duplicateScenario(
      mapScenarioHistoryItemToDuplicatedFormValues(historyItem),
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFocusedProblemLotId(null);
    toast.success('Senaryo kopyalanıp forma yüklendi.');
  };

  const handleDeleteScenario = async (historyItem) => {
    const scenarioName = historyItem.scenario.name || 'İsimsiz Senaryo';
    const isConfirmed = window.confirm(
      `"${scenarioName}" senaryosunu silmek istediğinize emin misiniz?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteScenarioMutation.mutateAsync(historyItem.scenario.id);
      toast.success('Senaryo silindi.');
    } catch (error) {
      toast.error(
        error?.message ||
          'Silme sırasında hata oluştu. DELETE policy eksik olabilir.',
      );
    }
  };

  if (isLoading) {
    return (
      <LogisticsPackagingLayout
        title="Paketleme Hesaplayıcı"
        subtitle="Paketleme verileri yükleniyor."
      >
        <div className="lp-panel">Yükleniyor...</div>
      </LogisticsPackagingLayout>
    );
  }

  const aggregateSummaryItems = mapAggregateResultToSummaryItems(
    scenario.aggregateResult,
  );

  return (
    <LogisticsPackagingLayout
      title="Paketleme Hesaplayıcı"
      subtitle="Aynı sevkiyat içinde birden fazla lotu hesaplayın, lot bazlı planı yönetin ve en altta genel toplamı görün."
      actions={
        <button type="button" className="lp-button" onClick={scenario.addLot}>
          Lot Ekle
        </button>
      }
    >
      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Senaryo Bilgisi</h3>
            <p className="lp-section-heading__description">
              Aynı sevkiyat içinde yer alan lotları tek senaryo altında yönetin.
            </p>
          </div>
        </div>

        <div className="lp-form-grid lp-form-grid--3">
          <label className="lp-field">
            <span className="lp-field__label">Senaryo Adı</span>
            <input
              className="lp-input"
              type="text"
              value={scenario.values.name}
              onChange={(event) => scenario.setScenarioName(event.target.value)}
              placeholder="Örn: Müşteri X / 14 Nisan Sevkiyatı"
            />
          </label>

          <div className="lp-field">
            <span className="lp-field__label">Lot Sayısı</span>
            <div className="lp-input">{scenario.values.lots.length}</div>
          </div>

          <div className="lp-field">
            <span className="lp-field__label">Genel Durum</span>
            <div className="lp-input">
              {translateValidationStatus(scenario.aggregateResult.validationStatus)}
            </div>
          </div>
        </div>
      </div>

      {scenario.values.lots.map((lot, index) => {
        const lotRules = allRules.filter(
          (rule) => rule.productId === lot.values.productId,
        );

        const allowedMaterialIds = lotRules.map((rule) => rule.materialId);
        const allowedSet = new Set(allowedMaterialIds);

        const allowedMaterials =
          allowedSet.size > 0
            ? materials.filter((item) => allowedSet.has(item.id))
            : materials;

        const allowedPallets = allowedMaterials.filter(
          (item) => item.materialType === 'PALLET',
        );

        const preferredPalletId = pickPreferredMaterial(allowedPallets, lotRules);
        const lotResult = scenario.getLotResult(lot.id);

        return (
          <div
            key={lot.id}
            id={`lp-scenario-lot-card-${lot.id}`}
            className={`lp-panel lp-scenario-lot-card ${getStatusClass(
              lotResult.validationStatus,
            )} ${focusedProblemLotId === lot.id ? 'is-focused' : ''}`}
          >
            <div className="lp-scenario-lot-card__header">
              <div className="lp-scenario-lot-card__meta">
                <h3 className="lp-scenario-lot-card__title">Lot {index + 1}</h3>
                <p className="lp-scenario-lot-card__description">
                  Her lot kendi ürün, ambalaj, palet ve istif planını ayrı hesaplar.
                </p>
              </div>

              <button
                type="button"
                className="lp-button lp-button--ghost"
                onClick={() => scenario.removeLot(lot.id)}
                disabled={scenario.values.lots.length === 1}
              >
                Lotu Sil
              </button>
            </div>

            <LotSummary
              values={lot.values}
              result={lotResult}
              products={products}
            />

            <CalculatorForm
              values={lot.values}
              result={lotResult}
              products={products}
              materials={materials}
              allowedMaterialIds={allowedMaterialIds}
              sharedStackGroupOptions={sharedStackGroupOptions}
              onChangeValues={(updater) => scenario.updateLotValues(lot.id, updater)}
              onAddPalletLine={() => scenario.addPalletLine(lot.id, preferredPalletId)}
              onRemovePalletLine={(lineId) => scenario.removePalletLine(lot.id, lineId)}
              onSubmit={handleSaveScenario}
              isSaving={isSaving}
              hideSubmit
            />
          </div>
        );
      })}

      <div className="lp-panel lp-scenario-summary-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Genel Toplam</h3>
            <p className="lp-section-heading__description">
              Tüm lotların toplam net, dara, brüt ve palet özeti.
            </p>
          </div>
        </div>

        <CalculationResultCards
          items={aggregateSummaryItems}
          status={scenario.aggregateResult.validationStatus}
        />
      </div>

      <div className="lp-panel">
        <StackSummary stacks={scenario.aggregateResult.stackSummaries} />
      </div>

      <div className="lp-form-actions">
        <button
          type="button"
          className="lp-button"
          disabled={isSaving}
          onClick={handleSaveScenario}
        >
          {isSaving ? 'Kaydediliyor...' : 'Senaryoyu Kaydet'}
        </button>
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Geçmiş Senaryolar</h3>
            <p className="lp-section-heading__description">
              Daha önce kaydedilen çoklu lot paketleme senaryoları.
            </p>
          </div>
        </div>

        <ScenarioHistory
          scenarios={scenarios}
          products={products}
          materials={materials}
          onLoadScenario={handleLoadScenario}
          onDuplicateScenario={handleDuplicateScenario}
          onDeleteScenario={handleDeleteScenario}
          deletingScenarioId={deleteScenarioMutation.variables ?? null}
        />
      </div>
    </LogisticsPackagingLayout>
  );
}