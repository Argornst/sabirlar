import { useState } from 'react';
import { ContainerLoadPlan } from '../container-load-plan/container-load-plan';
import './scenario-preview-panel.css';

export function ScenarioPreviewPanel({
  scenario,
  aggregateResult,
  products = [],
  materials = [],
}) {
  const [previewKey, setPreviewKey] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);

  return (
    <section className="lp-preview-panel">
      <div className="lp-preview-panel__sticky">
        <div className="lp-panel">
          <div className="lp-section-heading">
            <div>
              <h3 className="lp-section-heading__title">Konteyner Önizleme</h3>
              <p className="lp-section-heading__description">
                3D konteyner görünümü, filtreleme ve export işlemleri burada yer alır.
              </p>
            </div>

            {previewFailed ? (
              <button
                type="button"
                className="lp-button"
                onClick={() => {
                  setPreviewFailed(false);
                  setPreviewKey((value) => value + 1);
                }}
              >
                Önizlemeyi Yeniden Yükle
              </button>
            ) : null}
          </div>

          <div className="lp-preview-panel__canvas-wrap">
            {!previewFailed ? (
              <div key={previewKey}>
                <ContainerLoadPlan
                  scenario={scenario}
                  products={products}
                  materials={materials}
                  onRenderError={() => setPreviewFailed(true)}
                />
              </div>
            ) : (
              <div className="lp-preview-panel__fallback">
                <strong>3D önizleme geçici olarak kullanılamıyor.</strong>
                <span>
                  WebGL context kaybı oluştu. Yeniden yükle düğmesiyle tekrar deneyin.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}