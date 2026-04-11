import { Fragment, useMemo, useState } from 'react';
import './calculations-history-table.css';

function formatWeight(value) {
  const numeric = Number(value ?? 0);
  return `${numeric.toFixed(3)} kg`;
}

function formatHeight(value) {
  const numeric = Number(value ?? 0);
  return `${numeric.toFixed(2)} cm`;
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function getStatusClass(status) {
  if (status === 'VALID') return 'is-valid';
  if (status === 'WARNING') return 'is-warning';
  if (status === 'INVALID') return 'is-invalid';
  return '';
}

export function CalculationsHistoryTable({
  items = [],
  products = [],
  materials = [],
}) {
  const [expandedId, setExpandedId] = useState(null);

  const productMap = useMemo(() => {
    return new Map((products ?? []).map((product) => [product.id, product]));
  }, [products]);

  const materialMap = useMemo(() => {
    return new Map((materials ?? []).map((material) => [material.id, material]));
  }, [materials]);

  const toggleRow = (calculationId) => {
    setExpandedId((current) => (current === calculationId ? null : calculationId));
  };

  return (
    <div className="lp-history-table-wrapper">
      <table className="lp-history-table">
        <thead>
          <tr>
            <th>Lot</th>
            <th>Ürün</th>
            <th>Toplam Net</th>
            <th>Toplam Brüt</th>
            <th>Toplam Palet</th>
            <th>Toplam Ambalaj</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>Aksiyon</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={9}>
                <div className="lp-empty-state">Kayıtlı hesaplama bulunamadı.</div>
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const calculation = item?.calculation ?? {};
              const palletLines = item?.palletLines ?? [];
              const product = productMap.get(calculation.productId);
              const isExpanded = expandedId === calculation.id;
              const rowKey = calculation.id ?? `history-row-${index}`;

              return (
                <Fragment key={rowKey}>
                  <tr>
                    <td>{calculation.lotNumber ?? '-'}</td>
                    <td>{product ? `${product.code} - ${product.name}` : '-'}</td>
                    <td>{formatWeight(calculation.totalNetWeightKg)}</td>
                    <td>{formatWeight(calculation.totalGrossWeightKg)}</td>
                    <td>{calculation.totalPalletCount ?? 0}</td>
                    <td>{calculation.totalContainerCount ?? 0}</td>
                    <td>
                      <span
                        className={`lp-history-status ${getStatusClass(
                          calculation.validationStatus,
                        )}`}
                      >
                        {translateValidationStatus(calculation.validationStatus)}
                      </span>
                    </td>
                    <td>{formatDate(calculation.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="lp-button lp-button--ghost lp-button--sm"
                        onClick={() => toggleRow(calculation.id)}
                      >
                        {isExpanded ? 'Kapat' : 'Detay'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="lp-history-detail-card">
                          <div className="lp-history-detail-card__header">
                            <h4>Hesaplama Detayı</h4>
                            <p>
                              Lot bazlı palet satırları, palet başı yükseklik ve brüt
                              ağırlık bilgileri.
                            </p>
                          </div>

                          <div className="lp-history-detail-summary">
                            <div className="lp-history-detail-pill">
                              <span>Doğrulama</span>
                              <strong>
                                {translateValidationStatus(calculation.validationStatus)}
                              </strong>
                            </div>
                            <div className="lp-history-detail-pill">
                              <span>Toplam Net</span>
                              <strong>{formatWeight(calculation.totalNetWeightKg)}</strong>
                            </div>
                            <div className="lp-history-detail-pill">
                              <span>Toplam Brüt</span>
                              <strong>{formatWeight(calculation.totalGrossWeightKg)}</strong>
                            </div>
                            <div className="lp-history-detail-pill">
                              <span>Toplam Palet</span>
                              <strong>{calculation.totalPalletCount ?? 0}</strong>
                            </div>
                          </div>

                          <div className="lp-history-detail-table-wrapper">
                            <table className="lp-history-detail-table">
                              <thead>
                                <tr>
                                  <th>Palet</th>
                                  <th>Palet Adedi</th>
                                  <th>Palet Başına Ambalaj</th>
                                  <th>Toplam Ambalaj</th>
                                  <th>Palet Başına Yükseklik</th>
                                  <th>Palet Başına Brüt</th>
                                  <th>Satır Toplam Brüt</th>
                                  <th>İstif Grubu</th>
                                  <th>İstif Sırası</th>
                                </tr>
                              </thead>
                              <tbody>
                                {palletLines.length === 0 ? (
                                  <tr>
                                    <td colSpan={9}>
                                      <div className="lp-empty-state">
                                        Palet satırı bulunamadı.
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  palletLines.map((line, lineIndex) => {
                                    const palletMaterial = materialMap.get(line.palletMaterialId);

                                    const perPalletGross =
                                      Number(line.palletCount) > 0
                                        ? Number(line.palletGrossWeightKg ?? 0) /
                                          Number(line.palletCount)
                                        : 0;

                                    return (
                                      <tr key={line.id ?? `${rowKey}-line-${lineIndex}`}>
                                        <td>
                                          {palletMaterial
                                            ? `${palletMaterial.code} - ${palletMaterial.name}`
                                            : '-'}
                                        </td>
                                        <td>{line.palletCount ?? 0}</td>
                                        <td>
                                          {Number(line.palletCount) > 0
                                            ? Number(line.totalUnits ?? 0) /
                                              Number(line.palletCount)
                                            : 0}
                                        </td>
                                        <td>{line.totalUnits ?? 0}</td>
                                        <td>{formatHeight(line.palletHeightCm)}</td>
                                        <td>{formatWeight(perPalletGross)}</td>
                                        <td>{formatWeight(line.palletGrossWeightKg)}</td>
                                        <td>{line.stackGroup || '-'}</td>
                                        <td>{line.stackOrder ?? '-'}</td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>

                          {Array.isArray(calculation.validationMessages) &&
                          calculation.validationMessages.length > 0 ? (
                            <div className="lp-history-messages">
                              <h5>Doğrulama Mesajları</h5>
                              <div className="lp-history-messages__list">
                                {calculation.validationMessages.map((message, messageIndex) => (
                                  <div
                                    key={`${rowKey}-message-${messageIndex}`}
                                    className={`lp-history-message lp-history-message--${String(
                                      message.level || '',
                                    ).toLowerCase()}`}
                                  >
                                    <strong>
                                      {message.level === 'ERROR'
                                        ? 'Hata'
                                        : message.level === 'WARNING'
                                          ? 'Uyarı'
                                          : 'Bilgi'}
                                    </strong>
                                    <span>{message.message}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}