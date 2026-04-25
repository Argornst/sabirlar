import Button from "../../../../shared/components/ui/Button";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";

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
          <Input
            id="dispatch-log-search"
            type="text"
            placeholder="Müşteri, ürün, lot, yapan kişi..."
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="dispatch-log-action-type">İşlem Tipi</label>
          <Select
            id="dispatch-log-action-type"
            value={filters.actionType}
            onChange={(event) => onChange("actionType", event.target.value)}
          >
            <option value="">Tümü</option>
            <option value="move">Tekli taşıma</option>
            <option value="bulk_move">Toplu taşıma</option>
            <option value="update">Kayıt güncelleme</option>
          </Select>
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
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
        >
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
}
