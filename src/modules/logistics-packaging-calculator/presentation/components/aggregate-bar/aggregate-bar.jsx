import { useEffect, useMemo, useRef, useState } from 'react';
import { Warning, X } from '@phosphor-icons/react';
import Button from '../../../../../shared/components/ui/Button';
import IconButton from '../../../../../shared/components/ui/IconButton';
import './aggregate-bar.css';

function getLevelCounts(messages = []) {
  return messages.reduce(
    (acc, message) => {
      if (message.level === 'ERROR') acc.errors += 1;
      if (message.level === 'WARNING') acc.warnings += 1;
      return acc;
    },
    { errors: 0, warnings: 0 },
  );
}

function getStatusLabel(status) {
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

function sanitizeMessage(messageText, lots = []) {
  if (!messageText) return '';

  const lotMap = new Map(
    lots.map((lot, index) => [
      lot.id,
      lot.values?.lotNumber?.trim() || `Lot ${index + 1}`,
    ]),
  );

  let text = String(messageText);

  for (const [lotId, lotLabel] of lotMap.entries()) {
    const escaped = lotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(escaped, 'g'), lotLabel);
  }

  text = text.replace(
    /\[Lot ([a-f0-9-]{36})\]/gi,
    (_, rawId) => `[${lotMap.get(rawId) ?? 'Lot'}]`,
  );

  text = text.replace(
    /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
    'ilgili lot',
  );

  return text;
}

export function AggregateBar({ aggregate, lots = [] }) {
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const cards = useMemo(
    () => [
      {
        label: 'Genel Net',
        value: `${aggregate.totalNetWeightKg.toFixed(3)} kg`,
      },
      {
        label: 'Genel Brüt',
        value: `${aggregate.totalGrossWeightKg.toFixed(3)} kg`,
      },
      {
        label: 'Genel Dara',
        value: `${aggregate.totalTareWeightKg.toFixed(3)} kg`,
      },
      {
        label: 'Genel Palet',
        value: `${aggregate.totalPalletCount}`,
      },
      {
        label: 'Zemindeki Palet',
        value: `${aggregate.totalGroundPalletCount}`,
      },
      {
        label: 'Durum',
        value: getStatusLabel(aggregate.validationStatus),
        statusClass: getStatusClass(aggregate.validationStatus),
      },
    ],
    [aggregate],
  );

  const issueMessages = useMemo(
    () =>
      (aggregate.validationMessages ?? [])
        .filter((message) => message.level === 'ERROR' || message.level === 'WARNING')
        .map((message, index) => ({
          ...message,
          _id: `${message.code ?? 'msg'}-${index}`,
          sanitized: sanitizeMessage(message.message, lots),
        })),
    [aggregate.validationMessages, lots],
  );

  const counts = useMemo(
    () => getLevelCounts(aggregate.validationMessages ?? []),
    [aggregate.validationMessages],
  );

  useEffect(() => {
    if (!isIssuesOpen) return undefined;

    const handlePointerDown = (event) => {
      const popoverEl = popoverRef.current;
      const triggerEl = triggerRef.current;
      const target = event.target;

      if (
        popoverEl?.contains(target) ||
        triggerEl?.contains(target)
      ) {
        return;
      }

      setIsIssuesOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsIssuesOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isIssuesOpen]);

  return (
    <section className="lp-panel lp-aggregate-bar">
      <div className="lp-section-heading lp-aggregate-bar__heading">
        <div>
          <h3 className="lp-section-heading__title">Senaryo Toplamı</h3>
          <p className="lp-section-heading__description">
            Tüm lotların net, dara, brüt, palet ve validasyon özeti.
          </p>
        </div>

        <div className="lp-aggregate-bar__badges">
          {counts.errors > 0 || counts.warnings > 0 ? (
            <Button
              ref={triggerRef}
              type="button"
              variant="ghost"
              className={`lp-aggregate-bar__badge lp-aggregate-bar__badge--action ${
                counts.errors > 0 ? 'is-error' : 'is-warning'
              }`}
              onClick={() => setIsIssuesOpen((prev) => !prev)}
              aria-expanded={isIssuesOpen}
              aria-haspopup="dialog"
              title="Uyarı ve hata detaylarını aç"
            >
              <Warning size={14} weight="fill" />
              <span>
                {counts.errors > 0 ? `${counts.errors} hata` : `${counts.warnings} uyarı`}
              </span>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="lp-aggregate-bar__grid">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`lp-aggregate-bar__card ${card.statusClass ?? ''}`}
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      {isIssuesOpen ? (
        <div
          ref={popoverRef}
          className="lp-aggregate-bar__popover"
          role="dialog"
          aria-label="Senaryo hata ve uyarı detayları"
        >
          <div className="lp-aggregate-bar__popover-header">
            <div>
              <h4>Senaryo Sorunları</h4>
              <p>Bu liste senaryo toplamındaki hata ve uyarıları gösterir.</p>
            </div>

            <IconButton
              type="button"
              className="lp-aggregate-bar__popover-close"
              onClick={() => setIsIssuesOpen(false)}
              aria-label="Kapat"
            >
              <X size={16} />
            </IconButton>
          </div>

          <div className="lp-aggregate-bar__popover-list">
            {issueMessages.map((message) => (
              <div
                key={message._id}
                className={`lp-aggregate-bar__popover-item is-${String(
                  message.level || '',
                ).toLowerCase()}`}
              >
                <Warning size={16} weight="fill" />
                <span>{message.sanitized}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}