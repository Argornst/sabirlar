import { PRODUCTION_STATUSES } from '../../domain/entities/production.entity';

export function ProductionsFilters({ filters, onChange, onReset }) {
  return (
    <div className="production-card">
      <div className="production-card__header">
        <div>
          <h3 className="production-card__title">Filtreler</h3>
          <p className="production-card__subtitle">Listeyi müşteri, lot, tarih ve duruma göre daralt.</p>
        </div>
      </div>

      <div className="production-filters-grid">
        <div className="production-field">
          <label className="production-label">Arama</label>
          <input
            className="production-input"
            type="text"
            placeholder="Lot, müşteri, ürün..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Durum</label>
          <select
            className="production-input"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
          >
            <option value="">Tümü</option>
            {PRODUCTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="production-field">
          <label className="production-label">Başlangıç Tarihi</label>
          <input
            className="production-input"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange('dateFrom', e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Bitiş Tarihi</label>
          <input
            className="production-input"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="production-filters-actions">
        <label className="production-checkbox">
          <input
            type="checkbox"
            checked={filters.hasDispatchDate}
            onChange={(e) => onChange('hasDispatchDate', e.target.checked)}
          />
          <span>Sadece çıkış tarihi olanlar</span>
        </label>

        <button type="button" className="production-button production-button--ghost" onClick={onReset}>
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
}