import { useMemo, useRef, useState } from 'react';
import { CONTAINER_TYPES } from '../../../domain/types/container-load-plan.type';
import { useContainerLoadPlan } from '../../../application/hooks/use-container-load-plan';
import { ContainerLoadPlanScene } from './container-load-plan-scene';
import { mapLoadPlanReasonToLabel } from '../../../domain/services/container-load-plan.service';
import './container-load-plan.css';

function buildLotInputs(scenario, products = [], materials = []) {
  const productMap = new Map(products.map((item) => [item.id, item]));
  const materialMap = new Map(materials.map((item) => [item.id, item]));

  return scenario.values.lots.map((lot) => {
    const product = productMap.get(lot.values.productId);
    const loadMaterial = materialMap.get(lot.values.containerMaterialId);

    const lotResult = scenario.getLotResult(lot.id);
    const lineResultById = new Map(
      (lotResult?.palletLineResults ?? []).map((line) => [line.lineId, line]),
    );

    return {
      id: lot.id,
      lotNumber: lot.values.lotNumber,
      productId: lot.values.productId,
      productName: product?.name ?? '',
      productCode: product?.code ?? '',
      loadMaterialId: lot.values.containerMaterialId || '',
      loadMaterialCode: loadMaterial?.code ?? '',
      loadMaterialName: loadMaterial?.name ?? '',
      loadMaterialType: loadMaterial?.materialType ?? '',
      loadUnitWidthCm: loadMaterial?.widthCm ?? loadMaterial?.width_cm ?? null,
      loadUnitLengthCm: loadMaterial?.lengthCm ?? loadMaterial?.length_cm ?? null,
      loadUnitHeightCm: loadMaterial?.heightCm ?? loadMaterial?.height_cm ?? null,
      palletLines: lot.values.palletLines.map((line) => {
        const palletMaterial = materialMap.get(line.palletMaterialId);
        const lineResult = lineResultById.get(line.id);

        return {
          id: line.id,
          palletMaterialId: line.palletMaterialId,
          palletMaterialCode: palletMaterial?.code ?? '',
          palletMaterialName: palletMaterial?.name ?? '',
          palletWidthCm: palletMaterial?.widthCm ?? palletMaterial?.width_cm ?? null,
          palletLengthCm: palletMaterial?.lengthCm ?? palletMaterial?.length_cm ?? null,
          palletHeightCm:
            lineResult?.palletHeightCm ??
            palletMaterial?.heightCm ??
            palletMaterial?.height_cm ??
            null,
          palletCount: line.palletCount,
          unitsPerPallet: line.unitsPerPallet,
          stackGroup: line.stackGroup,
          stackOrder: line.stackOrder,
          palletGrossWeightKg: lineResult?.palletGrossWeightKg ?? null,
          totalLineGrossWeightKg: lineResult?.totalLineGrossWeightKg ?? null,
        };
      }),
    };
  });
}

function downloadDataUrl(dataUrl, fileName) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ActionButton({ onClick, children, variant = 'ghost', title }) {
  return (
    <button
      type="button"
      className={`lp-load-plan__icon-button lp-load-plan__icon-button--${variant}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export function ContainerLoadPlan({
  scenario,
  products = [],
  materials = [],
}) {
  const [containerType, setContainerType] = useState('20DC');
  const [cameraPreset, setCameraPreset] = useState('iso');
  const [selectedLotIds, setSelectedLotIds] = useState([]);
  const controlsRef = useRef(null);
  const sceneCanvasRef = useRef(null);

  const container = CONTAINER_TYPES[containerType];
  const lotInputs = useMemo(
    () => buildLotInputs(scenario, products, materials),
    [materials, products, scenario],
  );

  const data = useContainerLoadPlan({
    lots: lotInputs,
    container: {
      key: container.key,
      label: container.label,
      innerLengthCm: container.innerLengthCm,
      innerWidthCm: container.innerWidthCm,
      innerHeightCm: container.innerHeightCm,
      maxPayloadKg: container.maxPayloadKg,
    },
  });

  const unitsPerPalletByLineId = useMemo(() => {
    const map = new Map();

    scenario.values.lots.forEach((lot) => {
      lot.values.palletLines.forEach((line) => {
        map.set(line.id, line.unitsPerPallet);
      });
    });

    return map;
  }, [scenario.values.lots]);

  const handleToggleLot = (lotId) => {
    setSelectedLotIds((current) =>
      current.includes(lotId)
        ? current.filter((id) => id !== lotId)
        : [...current, lotId],
    );
  };

  const handleResetFilters = () => {
    setSelectedLotIds([]);
  };

  const handleExportJson = () => {
    if (!data) {
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    downloadBlob(blob, `container-load-plan-${containerType}.json`);
  };

  const handleExportPng = () => {
    const canvas = sceneCanvasRef.current;

    if (!canvas) {
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, `container-load-plan-${containerType}.png`);
  };

  const handleResetCamera = () => {
    setCameraPreset('iso');

    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const visiblePlacements = useMemo(() => {
    if (!data) return [];
    if (selectedLotIds.length === 0) return data.placements;
    return data.placements.filter((item) => selectedLotIds.includes(item.lotId));
  }, [data, selectedLotIds]);

  return (
    <div className="lp-panel lp-load-plan">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">3D Konteyner Yükleme Planı</h3>
          <p className="lp-section-heading__description">
            Tüm lotları aynı konteyner içinde izometrik olarak görüntüleyin, filtreleyin ve dışa aktarın.
          </p>
        </div>

        <div className="lp-load-plan__actions">
          <ActionButton variant="ghost" onClick={handleExportJson} title="JSON dışa aktar">
            {'{}'}
          </ActionButton>
          <ActionButton variant="primary" onClick={handleExportPng} title="PNG dışa aktar">
            PNG
          </ActionButton>
        </div>
      </div>

      <div className="lp-load-plan__toolbar">
        <label className="lp-field">
          <span className="lp-field__label">Konteyner</span>
          <select
            className="lp-input"
            value={containerType}
            onChange={(event) => setContainerType(event.target.value)}
          >
            {Object.entries(CONTAINER_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Görünüş</span>
          <select
            className="lp-input"
            value={cameraPreset}
            onChange={(event) => setCameraPreset(event.target.value)}
          >
            <option value="iso">İzometrik</option>
            <option value="front">Ön</option>
            <option value="side">Yan</option>
          </select>
        </label>

        <div className="lp-field">
          <span className="lp-field__label">Kamera</span>
          <button
            type="button"
            className="lp-button lp-button--ghost"
            onClick={handleResetCamera}
          >
            Kamerayı Sıfırla
          </button>
        </div>
      </div>

      <div className="lp-load-plan__summary-grid">
        <div className="lp-load-plan__summary-card">
          <span>Yerleşen birim</span>
          <strong>{data?.totalPlacedUnits ?? 0}</strong>
        </div>
        <div className="lp-load-plan__summary-card">
          <span>Doluluk</span>
          <strong>{data?.occupancyPercent ?? 0}%</strong>
        </div>
        <div className="lp-load-plan__summary-card">
          <span>Toplam ağırlık</span>
          <strong>{data?.totalPlacedWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
        </div>
        <div className="lp-load-plan__summary-card">
          <span>Sığmayan</span>
          <strong>{data?.unplaced.length ?? 0}</strong>
        </div>
      </div>

      <div className="lp-load-plan__legend">
        <div className="lp-load-plan__legend-header">
          <span className="lp-field__label">Lot filtresi</span>
          <button
            type="button"
            className="lp-load-plan__clear-filter"
            onClick={handleResetFilters}
          >
            Filtreyi temizle
          </button>
        </div>

        <div className="lp-load-plan__legend-items">
          {(data?.legend ?? []).map((item) => {
            const active =
              selectedLotIds.length === 0 || selectedLotIds.includes(item.lotId);

            return (
              <button
                key={item.lotId}
                type="button"
                className={`lp-load-plan__legend-item ${active ? 'is-active' : ''}`}
                onClick={() => handleToggleLot(item.lotId)}
              >
                <span
                  className="lp-load-plan__legend-color"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lp-load-plan__viewport">
        {data ? (
          <ContainerLoadPlanScene
            data={data}
            selectedLotIds={selectedLotIds}
            cameraPreset={cameraPreset}
            controlsRef={controlsRef}
            sceneCanvasRef={sceneCanvasRef}
            unitsPerPalletByLineId={unitsPerPalletByLineId}
          />
        ) : (
          <div className="lp-empty-state">Henüz görselleştirilecek veri yok.</div>
        )}
      </div>

      <div className="lp-load-plan__bottom-grid">
        <div className="lp-load-plan__distribution">
          <h4>Yük Dağılımı</h4>
          <div className="lp-load-plan__distribution-grid">
            <div>
              <span>Sol</span>
              <strong>{data?.balance.leftWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
            <div>
              <span>Sağ</span>
              <strong>{data?.balance.rightWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
            <div>
              <span>Ön</span>
              <strong>{data?.balance.frontWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
            <div>
              <span>Arka</span>
              <strong>{data?.balance.rearWeightKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
            <div>
              <span>Sol/Sağ Fark</span>
              <strong>{data?.balance.leftRightDeltaKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
            <div>
              <span>Ön/Arka Fark</span>
              <strong>{data?.balance.frontRearDeltaKg?.toFixed(3) ?? '0.000'} kg</strong>
            </div>
          </div>
        </div>

        <div className="lp-load-plan__unplaced">
          <h4>Sığmayanlar</h4>
          {data?.unplaced.length ? (
            <div className="lp-load-plan__unplaced-list">
              {data.unplaced.map((item) => (
                <div key={item.id} className="lp-load-plan__unplaced-item">
                  <strong>{item.lotNumber}</strong>
                  <span>{item.palletMaterialCode || '-'}</span>
                  <span>{mapLoadPlanReasonToLabel(item.reason)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="lp-empty-state">Tüm paletler konteynıra yerleşti.</div>
          )}
        </div>
      </div>

      <div className="lp-load-plan__footnote">
        <small>
          Görünen yerleşim: {visiblePlacements.length} adet. Palet yönü sistem tarafından otomatik döndürülerek optimize edilir.
        </small>
      </div>
    </div>
  );
}