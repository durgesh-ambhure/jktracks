import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

export default function WeightBoxesFieldArray({ control, register, watch, setValue }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'weightDetails.boxes' });
  const divisor = Number(watch('weightDetails.divisor')) || 5000;

  const recalcVolumetric = (index) => {
    const l = Number(watch(`weightDetails.boxes.${index}.length`)) || 0;
    const w = Number(watch(`weightDetails.boxes.${index}.width`)) || 0;
    const h = Number(watch(`weightDetails.boxes.${index}.height`)) || 0;
    const pcs = Number(watch(`weightDetails.boxes.${index}.pcs`)) || 1;
    const actualWeight = Number(watch(`weightDetails.boxes.${index}.actualWeight`)) || 0;
    const vol = divisor > 0 ? (l * w * h * pcs) / divisor : 0;
    const volRounded = vol ? Number(vol.toFixed(2)) : 0;
    setValue(`weightDetails.boxes.${index}.volumetricWeight`, volRounded);
    setValue(`weightDetails.boxes.${index}.chargeableWeight`, Math.max(actualWeight, volRounded));
  };

  return (
    <div>
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: 940 }}>
          <thead>
            <tr>
              <th>Parcel No</th>
              <th>Box No</th>
              <th>Pcs</th>
              <th>Length (cm)</th>
              <th>Width (cm)</th>
              <th>Height (cm)</th>
              <th>Actual Wt (kg)</th>
              <th>Volumetric Wt (kg)</th>
              <th>Chargeable Wt (kg)</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td>
                  <input className="form-control" {...register(`weightDetails.boxes.${index}.parcelNo`)} />
                </td>
                <td>
                  <input className="form-control" {...register(`weightDetails.boxes.${index}.boxNo`)} />
                </td>
                <td>
                  <input className="form-control" type="number" min="1" {...register(`weightDetails.boxes.${index}.pcs`)} onBlur={() => recalcVolumetric(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`weightDetails.boxes.${index}.length`)} onBlur={() => recalcVolumetric(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`weightDetails.boxes.${index}.width`)} onBlur={() => recalcVolumetric(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`weightDetails.boxes.${index}.height`)} onBlur={() => recalcVolumetric(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`weightDetails.boxes.${index}.actualWeight`)} onBlur={() => recalcVolumetric(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" readOnly {...register(`weightDetails.boxes.${index}.volumetricWeight`)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" readOnly {...register(`weightDetails.boxes.${index}.chargeableWeight`)} />
                </td>
                <td>
                  <button type="button" className="btn btn-ghost btn-sm btn-icon-only" onClick={() => remove(index)} aria-label="Remove box">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 'var(--space-3)' }}
        onClick={() => append({ parcelNo: '', boxNo: '', length: '', width: '', height: '', pcs: 1, actualWeight: '', volumetricWeight: 0, chargeableWeight: 0 })}
      >
        <Plus size={14} /> Add Box
      </button>
      <p className="form-hint" style={{ marginTop: 'var(--space-2)' }}>
        Volumetric weight = (L × W × H × Pcs) / Divisor. Divisor is set in Weight Details above.
      </p>
    </div>
  );
}
