import Button from '../../../../../shared/components/ui/Button';
import Input from '../../../../../shared/components/ui/Input';
import Select from '../../../../../shared/components/ui/Select';

function normalizeNumber(value) {
  return value === '' ? null : Number(value);
}

export function MaterialFormModal({
  value,
  onChange,
  onSubmit,
  isSaving,
}) {
  return (
    <form
      className="lp-material-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="lp-form-grid lp-form-grid--4">
        <label className="lp-field">
          <span className="lp-field__label">Kod</span>
          <Input
            className="lp-input"
            value={value.code}
            onChange={(event) => onChange({ code: event.target.value })}
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Ad</span>
          <Input
            className="lp-input"
            value={value.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Tip</span>
          <Select
            className="lp-input"
            value={value.materialType}
            onChange={(event) => onChange({ materialType: event.target.value })}
          >
            <option value="PALLET">Palet</option>
            <option value="BOX">Kutu</option>
            <option value="VACUUM_BAG">Vakum Torbası</option>
            <option value="DRUM">Varil</option>
          </Select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Dara (kg)</span>
          <Input
            className="lp-input"
            type="number"
            step="0.001"
            value={value.tareWeightKg}
            onChange={(event) =>
              onChange({
                tareWeightKg: event.target.value === '' ? 0 : Number(event.target.value),
              })
            }
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">En (cm)</span>
          <Input
            className="lp-input"
            type="number"
            step="0.01"
            value={value.widthCm ?? ''}
            onChange={(event) =>
              onChange({ widthCm: normalizeNumber(event.target.value) })
            }
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Boy (cm)</span>
          <Input
            className="lp-input"
            type="number"
            step="0.01"
            value={value.lengthCm ?? ''}
            onChange={(event) =>
              onChange({ lengthCm: normalizeNumber(event.target.value) })
            }
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Yükseklik (cm)</span>
          <Input
            className="lp-input"
            type="number"
            step="0.01"
            value={value.heightCm ?? ''}
            onChange={(event) =>
              onChange({ heightCm: normalizeNumber(event.target.value) })
            }
          />
        </label>
      </div>

      <div className="lp-form-actions">
        <Button type="submit" className="lp-button" disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Malzemeyi Kaydet'}
        </Button>
      </div>
    </form>
  );
}
