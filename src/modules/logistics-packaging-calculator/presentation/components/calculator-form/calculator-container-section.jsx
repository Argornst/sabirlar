import Field from '../../../../../shared/components/ui/Field';
import Input from '../../../../../shared/components/ui/Input';
import Select from '../../../../../shared/components/ui/Select';

function preventWheelChange(event) {
  event.currentTarget.blur();
}

export function CalculatorContainerSection({
  values,
  containerOptions,
  vacuumBagOptions,
  onChange,
}) {
  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Ambalaj Bilgisi</h3>
          <p className="lp-section-heading__description">
            Kutu / varil ve opsiyonel vakum torbası seçin.
          </p>
        </div>
      </div>

      <div className="lp-form-grid lp-form-grid--4">
        <Field label="Taşıyıcı Ambalaj" className="lp-field">
          <Select
            className="lp-input"
            value={values.containerMaterialId}
            onChange={(event) => onChange({ containerMaterialId: event.target.value })}
          >
            <option value="">Ambalaj seçin</option>
            {containerOptions.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} - {material.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Vakum Torbası" className="lp-field">
          <Select
            className="lp-input"
            value={values.vacuumBagMaterialId ?? ''}
            onChange={(event) =>
              onChange({
                vacuumBagMaterialId: event.target.value || null,
              })
            }
          >
            <option value="">Yok</option>
            {vacuumBagOptions.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} - {material.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Birim Net Ağırlık (kg)" className="lp-field">
          <Input
            className="lp-input"
            type="number"
            min="0"
            step="0.001"
            value={values.unitNetWeightKg}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange({
                unitNetWeightKg: event.target.value === '' ? '' : Number(event.target.value),
              })
            }
          />
        </Field>

        <Field label="Not" className="lp-field">
          <Input
            className="lp-input"
            type="text"
            value={values.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Opsiyonel not"
          />
        </Field>
      </div>
    </div>
  );
}
