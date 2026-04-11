import { useEffect, useMemo, useState } from 'react';
import './product-packaging-rules-manager.css';

const MATERIAL_TABS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'PALLET', label: 'Palet' },
  { key: 'BOX', label: 'Kutu' },
  { key: 'VACUUM_BAG', label: 'Vakum Torbası' },
  { key: 'DRUM', label: 'Varil' },
];

function buildInitialSelection(materials, rules) {
  const ruleMap = new Map(
    rules.map((rule) => [
      rule.materialId,
      {
        selected: true,
        isRequired: rule.isRequired,
      },
    ]),
  );

  return materials.reduce((acc, material) => {
    const current = ruleMap.get(material.id);

    acc[material.id] = {
      selected: current?.selected ?? false,
      isRequired: current?.isRequired ?? false,
    };

    return acc;
  }, {});
}

function buildSelectionSnapshot(selection) {
  return JSON.stringify(
    Object.entries(selection)
      .filter(([, value]) => value?.selected)
      .map(([materialId, value]) => ({
        materialId,
        isRequired: Boolean(value?.isRequired),
      }))
      .sort((a, b) => a.materialId.localeCompare(b.materialId)),
  );
}

function getMaterialTypeLabel(type) {
  if (type === 'PALLET') return 'Palet';
  if (type === 'BOX') return 'Kutu';
  if (type === 'VACUUM_BAG') return 'Vakum Torbası';
  if (type === 'DRUM') return 'Varil';
  return type;
}

export function ProductPackagingRulesManager({
  products,
  materials,
  selectedProductId,
  onSelectProduct,
  rules,
  onSave,
  isSaving,
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selection, setSelection] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSelection(buildInitialSelection(materials, rules));
  }, [materials, rules, selectedProductId]);

  const isProductSelected = Boolean(selectedProductId);
  const normalizedSearch = search.trim().toLocaleLowerCase('tr');

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const tabMatches = activeTab === 'ALL' || material.materialType === activeTab;
      if (!tabMatches) return false;

      if (!normalizedSearch) return true;

      const searchable = `${material.code} ${material.name} ${material.materialType}`
        .toLocaleLowerCase('tr');

      return searchable.includes(normalizedSearch);
    });
  }, [activeTab, materials, normalizedSearch]);

  const selectedMaterials = useMemo(() => {
    return materials.filter((material) => selection[material.id]?.selected);
  }, [materials, selection]);

  const selectedCount = selectedMaterials.length;
  const requiredCount = selectedMaterials.filter(
    (material) => selection[material.id]?.isRequired,
  ).length;

  const currentSnapshot = useMemo(
    () => buildSelectionSnapshot(selection),
    [selection],
  );

  const initialSnapshot = useMemo(
    () => buildSelectionSnapshot(buildInitialSelection(materials, rules)),
    [materials, rules],
  );

  const hasChanges = currentSnapshot !== initialSnapshot;

  const handleToggleMaterial = (materialId, checked) => {
    setSelection((current) => ({
      ...current,
      [materialId]: {
        selected: checked,
        isRequired: checked ? current[materialId]?.isRequired ?? false : false,
      },
    }));
  };

  const handleToggleRequired = (materialId) => {
    setSelection((current) => ({
      ...current,
      [materialId]: {
        selected: current[materialId]?.selected ?? false,
        isRequired: !current[materialId]?.isRequired,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProductId) {
      throw new Error('Önce ürün seçmelisiniz.');
    }

    const payload = Object.entries(selection)
      .filter(([, value]) => value?.selected)
      .map(([materialId, value]) => ({
        materialId,
        isRequired: Boolean(value?.isRequired),
      }));

    await onSave({
      productId: selectedProductId,
      rules: payload,
    });
  };

  return (
    <div className="lp-rules-manager">
      <div className="lp-panel lp-rules-hero">
        <div className="lp-rules-hero__content">
          <div className="lp-rules-hero__eyebrow">Ürün ↔ Ambalaj Eşleşmesi</div>
          <h3 className="lp-rules-hero__title">Ambalaj Kurallarını Tanımla</h3>
          <p className="lp-rules-hero__description">
            Bu ekranda ürün için hangi palet, kutu, vakum torbası ve varil tiplerinin
            kullanılabileceğini belirliyorsun. Buradaki amaç hesap parametresi değil,
            izinli kombinasyonları yönetmek.
          </p>
        </div>

        <div className="lp-rules-hero__stats">
          <div className="lp-rules-stat-card">
            <span>Seçili Ambalaj</span>
            <strong>{selectedCount}</strong>
          </div>
          <div className="lp-rules-stat-card">
            <span>Zorunlu</span>
            <strong>{requiredCount}</strong>
          </div>
          <div className={`lp-rules-stat-card ${hasChanges ? 'is-dirty' : ''}`}>
            <span>Değişiklik</span>
            <strong>{hasChanges ? 'Var' : 'Yok'}</strong>
          </div>
        </div>
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Ürün Seçimi</h3>
            <p className="lp-section-heading__description">
              Önce ürün seç, ardından ilgili ambalaj kurallarını düzenle.
            </p>
          </div>
        </div>

        <div className="lp-form-grid lp-form-grid--3">
          <label className="lp-field">
            <span className="lp-field__label">Ürün</span>
            <select
              className="lp-input"
              value={selectedProductId}
              onChange={(event) => onSelectProduct(event.target.value)}
            >
              <option value="">Ürün seçin</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="lp-field">
            <span className="lp-field__label">Ara</span>
            <input
              className="lp-input"
              type="text"
              placeholder="Kod veya ad ile filtrele"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={!isProductSelected}
            />
          </label>

          <div className="lp-field">
            <span className="lp-field__label">Durum</span>
            <div className="lp-rules-status-box">
              {isProductSelected
                ? hasChanges
                  ? 'Kaydedilmemiş değişiklikler var'
                  : 'Kurallar senkron'
                : 'Düzenleme için ürün seçin'}
            </div>
          </div>
        </div>
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Seçili Ambalajlar</h3>
            <p className="lp-section-heading__description">
              Ürün için seçilen malzemeler aşağıda chip/kart görünümünde özetlenir.
            </p>
          </div>
        </div>

        {!isProductSelected ? (
          <div className="lp-empty-state">Özet için önce ürün seçin.</div>
        ) : selectedMaterials.length === 0 ? (
          <div className="lp-empty-state">Henüz bu ürün için ambalaj seçilmedi.</div>
        ) : (
          <div className="lp-selected-chips">
            {selectedMaterials.map((material) => {
              const state = selection[material.id];

              return (
                <div key={material.id} className="lp-selected-chip-card">
                  <div className="lp-selected-chip-card__top">
                    <span className="lp-selected-chip-card__type">
                      {getMaterialTypeLabel(material.materialType)}
                    </span>
                    <button
                      type="button"
                      className="lp-chip-remove-button"
                      onClick={() => handleToggleMaterial(material.id, false)}
                    >
                      Kaldır
                    </button>
                  </div>

                  <div className="lp-selected-chip-card__code">{material.code}</div>
                  <div className="lp-selected-chip-card__name">{material.name}</div>

                  <div className="lp-selected-chip-card__footer">
                    <button
                      type="button"
                      className={`lp-required-toggle ${state?.isRequired ? 'is-active' : ''}`}
                      onClick={() => handleToggleRequired(material.id)}
                    >
                      {state?.isRequired ? 'Zorunlu' : 'Opsiyonel'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Ambalaj Havuzu</h3>
            <p className="lp-section-heading__description">
              Ürün seçildikten sonra tip bazlı sekmelerden izinli ambalajları seçebilirsin.
            </p>
          </div>
        </div>

        <div className="lp-rules-tabs">
          {MATERIAL_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`lp-rules-tab ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              disabled={!isProductSelected}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!isProductSelected ? (
          <div className="lp-empty-state">Ambalajları düzenlemek için önce ürün seçin.</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="lp-empty-state">Bu filtreye uygun malzeme bulunamadı.</div>
        ) : (
          <div className="lp-material-cards-grid">
            {filteredMaterials.map((material) => {
              const state = selection[material.id] ?? {
                selected: false,
                isRequired: false,
              };

              return (
                <div
                  key={material.id}
                  className={`lp-material-rule-card ${state.selected ? 'is-selected' : ''}`}
                >
                  <div className="lp-material-rule-card__header">
                    <div>
                      <div className="lp-material-rule-card__code">{material.code}</div>
                      <div className="lp-material-rule-card__name">{material.name}</div>
                    </div>

                    <span className="lp-material-rule-card__badge">
                      {getMaterialTypeLabel(material.materialType)}
                    </span>
                  </div>

                  <div className="lp-material-rule-card__meta">
                    <span>
                      Ölçü: {material.widthCm ?? '-'} x {material.lengthCm ?? '-'} x{' '}
                      {material.heightCm ?? '-'}
                    </span>
                    <span>Dara: {material.tareWeightKg ?? '-'} kg</span>
                  </div>

                  <div className="lp-material-rule-card__actions">
                    <button
                      type="button"
                      className={`lp-select-toggle ${state.selected ? 'is-selected' : ''}`}
                      onClick={() => handleToggleMaterial(material.id, !state.selected)}
                    >
                      {state.selected ? 'Seçildi' : 'Seç'}
                    </button>

                    <button
                      type="button"
                      className={`lp-required-toggle ${state.isRequired ? 'is-active' : ''}`}
                      disabled={!state.selected}
                      onClick={() => handleToggleRequired(material.id)}
                    >
                      {state.isRequired ? 'Zorunlu' : 'Opsiyonel'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="lp-form-actions">
          <button
            type="button"
            className="lp-button lp-button--ghost"
            disabled={!isProductSelected || !hasChanges || isSaving}
            onClick={() => setSelection(buildInitialSelection(materials, rules))}
          >
            Değişiklikleri Geri Al
          </button>

          <button
            type="button"
            className="lp-button"
            onClick={handleSubmit}
            disabled={!isProductSelected || !hasChanges || isSaving}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kuralları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}