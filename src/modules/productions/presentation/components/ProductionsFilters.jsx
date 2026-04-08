import FilterBar from "../../../../shared/components/ui/FilterBar";
import { PRODUCTION_STATUSES } from "../../domain/entities/production.entity";

const STATUS_LABELS = {
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  sevk_planlandi: "Sevk Planlandı",
  sevk_edildi: "Sevk Edildi",
};

export function ProductionsFilters({
  filters,
  onChange,
  onReset,
  actions = null,
}) {
  return (
    <FilterBar>
      <div className="productions-filters">
        <div className="productions-filters__fields">
          <div className="filter-field">
            <label htmlFor="productions-search">Ara</label>
            <input
              id="productions-search"
              type="text"
              placeholder="Lot, müşteri, ürün ara"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="productions-status">Durum</label>
            <select
              id="productions-status"
              className="form-select"
              value={filters.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="">Tümü</option>
              {PRODUCTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="productions-date-from">Başlangıç Tarihi</label>
            <input
              id="productions-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onChange("dateFrom", event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="productions-date-to">Bitiş Tarihi</label>
            <input
              id="productions-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(event) => onChange("dateTo", event.target.value)}
            />
          </div>
        </div>

        <div className="productions-filters__actions">
          <label className="productions-filters__checkbox">
            <input
              type="checkbox"
              checked={filters.hasDispatchDate}
              onChange={(event) =>
                onChange("hasDispatchDate", event.target.checked)
              }
            />
            <span>Sadece çıkış tarihi olanlar</span>
          </label>

          <div className="productions-filters__buttons">
            {actions}
            <button
              type="button"
              className="ui-button ui-button--ghost productions-filters__reset"
              onClick={onReset}
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>
    </FilterBar>
  );
}