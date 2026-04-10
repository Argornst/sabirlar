import DatePicker from "../../../../shared/components/ui/DatePicker";

export default function DispatchLogsFilters({
  filters,
  onChange,
  onReset,
}) {
  return (
    <div className="dispatch-log-filters">
      <div className="dispatch-log-filters__grid">
        <div className="filter-field">
          <label htmlFor="dispatch-log-search">Ara</label>
          <input
            id="dispatch-log-search"
            type="text"
            placeholder="Müşteri, ürün, lot, yapan kişi..."
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="dispatch-log-action-type">İşlem Tipi</label>
          <select
            id="dispatch-log-action-type"
            className="form-select"
            value={filters.actionType}
            onChange={(event) => onChange("actionType", event.target.value)}
          >
            <option value="">Tümü</option>
            <option value="move">Tekli taşıma</option>
            <option value="bulk_move">Toplu taşıma</option>
            <option value="update">Kayıt güncelleme</option>
          </select>
        </div>

        <div className="filter-field">
          <label>Başlangıç</label>
          <DatePicker
            value={filters.fromDate}
            onChange={(event) => onChange("fromDate", event.target.value)}
            placeholder="Başlangıç tarihi"
            size="sm"
          />
        </div>

        <div className="filter-field">
          <label>Bitiş</label>
          <DatePicker
            value={filters.toDate}
            onChange={(event) => onChange("toDate", event.target.value)}
            placeholder="Bitiş tarihi"
            size="sm"
          />
        </div>
      </div>

      <div className="dispatch-log-filters__footer">
        <button
          type="button"
          className="dispatch-chip-button dispatch-chip-button--ghost"
          onClick={onReset}
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
}