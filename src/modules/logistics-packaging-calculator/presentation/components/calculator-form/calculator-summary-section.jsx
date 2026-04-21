import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';
import './calculator-summary-section.css';

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function groupMessages(messages) {
  return messages.reduce(
    (acc, message) => {
      if (message.level === 'ERROR') {
        acc.error.push(message);
      } else if (message.level === 'WARNING') {
        acc.warning.push(message);
      } else {
        acc.info.push(message);
      }

      return acc;
    },
    {
      error: [],
      warning: [],
      info: [],
    },
  );
}

function sanitizeMessage(messageText) {
  if (!messageText) return '';

  return String(messageText)
    .replace(/\[Lot ([a-f0-9-]{36})\]/gi, 'Bu lot')
    .replace(
      /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
      'ilgili kayıt',
    );
}

function IssueList({ items, type }) {
  return (
    <div className="lp-summary-modern__list">
      {items.map((message, index) => (
        <div
          key={`${message.code}-${index}`}
          className={`lp-summary-modern__list-item is-${type}`}
        >
          <AlertTriangle size={16} className="lp-summary-modern__icon" />
          <span>{sanitizeMessage(message.message)}</span>
        </div>
      ))}
    </div>
  );
}

export function CalculatorSummarySection({ summaryItems, result }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const messages = result.validationMessages ?? [];
  const grouped = useMemo(() => groupMessages(messages), [messages]);
  const totalIssues = grouped.error.length + grouped.warning.length;

  return (
    <div className="lp-panel lp-summary-section">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Lot Özeti</h3>
          <p className="lp-section-heading__description">
            Net, dara, brüt ve doğrulama sonucu.
          </p>
        </div>
      </div>

      <div className="lp-summary-grid">
        {summaryItems.map((item) => (
          <div key={item.label} className="lp-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}

        <div className="lp-summary-card">
          <span>Doğrulama</span>
          <strong>{translateValidationStatus(result.validationStatus)}</strong>
        </div>
      </div>

      {totalIssues > 0 ? (
        <div className="lp-summary-modern">
          <div className="lp-summary-modern__hero">
            <div className="lp-summary-modern__hero-left">
              <div className="lp-summary-modern__headline">
                <AlertTriangle size={18} className="lp-summary-modern__icon" />
                <div>
                  <strong>Öncelikli Düzeltilmesi Gereken Noktalar</strong>
                  <p>
                    {grouped.error.length > 0 ? `${grouped.error.length} hata` : 'Hata yok'}
                    {grouped.warning.length > 0 ? ` • ${grouped.warning.length} uyarı` : ''}
                  </p>
                </div>
              </div>

              <div className="lp-summary-modern__chips">
                {grouped.error.length > 0 ? (
                  <span className="is-error">{grouped.error.length} hata</span>
                ) : null}
                {grouped.warning.length > 0 ? (
                  <span className="is-warning">{grouped.warning.length} uyarı</span>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="lp-summary-modern__toggle"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? (
                <ChevronUp size={16} className="lp-summary-modern__chevron" />
              ) : (
                <ChevronDown size={16} className="lp-summary-modern__chevron" />
              )}
              {isExpanded ? 'Detayları Gizle' : 'Detayları Aç'}
            </Button>
          </div>

          {!isExpanded ? (
            <div className="lp-summary-modern__collapsed-note">
              Detaylar kapalı. Tam listeyi görmek için “Detayları Aç” butonunu kullanın.
            </div>
          ) : (
            <div className="lp-summary-modern__details">
              {grouped.error.length > 0 ? (
                <div className="lp-summary-modern__column">
                  <h4>Hatalar</h4>
                  <IssueList items={grouped.error} type="error" />
                </div>
              ) : null}

              {grouped.warning.length > 0 ? (
                <div className="lp-summary-modern__column">
                  <h4>Uyarılar</h4>
                  <IssueList items={grouped.warning} type="warning" />
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}