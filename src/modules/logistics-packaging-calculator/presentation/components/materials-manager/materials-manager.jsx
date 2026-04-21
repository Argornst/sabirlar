import { useMemo, useState } from 'react';
import Select from '../../../../../shared/components/ui/Select';
import Table, {
  TableScroll,
} from '../../../../../shared/components/ui/Table';
import './materials-manager.css';
import { MaterialFormModal } from './material-form-modal';

function createDefaultMaterialForm() {
  return {
    code: '',
    name: '',
    materialType: 'PALLET',
    tareWeightKg: 0,
    widthCm: null,
    lengthCm: null,
    heightCm: null,
    isStackable: false,
    isActive: true,
    metadata: {},
  };
}

export function MaterialsManager({
  materials,
  onCreateMaterial,
  isSaving,
}) {
  const [form, setForm] = useState(createDefaultMaterialForm());
  const [filter, setFilter] = useState('ALL');

  const filteredMaterials = useMemo(() => {
    if (filter === 'ALL') return materials;
    return materials.filter((item) => item.materialType === filter);
  }, [filter, materials]);

  return (
    <div className="lp-materials-manager">
      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Malzeme Yönetimi</h3>
            <p className="lp-section-heading__description">
              Palet, kutu, vakum torbası ve varil master verilerini buradan yönetin.
            </p>
          </div>

          <label className="lp-field lp-field--inline">
            <span className="lp-field__label">Filtre</span>
            <Select
              className="lp-input"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">Tümü</option>
              <option value="PALLET">Palet</option>
              <option value="BOX">Kutu</option>
              <option value="VACUUM_BAG">Vakum Torbası</option>
              <option value="DRUM">Varil</option>
            </Select>
          </label>
        </div>

        <TableScroll className="lp-materials-table-wrapper">
          <Table className="lp-materials-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ad</th>
                <th>Tip</th>
                <th>Dara</th>
                <th>En</th>
                <th>Boy</th>
                <th>Yükseklik</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="lp-empty-state">Kayıt bulunamadı.</div>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.code}</td>
                    <td>{material.name}</td>
                    <td>{material.materialType}</td>
                    <td>{material.tareWeightKg}</td>
                    <td>{material.widthCm ?? '-'}</td>
                    <td>{material.lengthCm ?? '-'}</td>
                    <td>{material.heightCm ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableScroll>
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Yeni Malzeme</h3>
            <p className="lp-section-heading__description">
              Master veriye yeni malzeme kartı ekleyin.
            </p>
          </div>
        </div>

        <MaterialFormModal
          value={form}
          onChange={(patch) =>
            setForm((current) => ({
              ...current,
              ...patch,
            }))
          }
          onSubmit={async () => {
            await onCreateMaterial(form);
            setForm(createDefaultMaterialForm());
          }}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
