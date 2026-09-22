import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { UNIT_TYPE_OPTIONS } from '../../utils/constants';

/**
 * Line-items table for the shipment's commercial invoice (box no / HS code / qty / IGST /
 * unit rate → amount), shown only when "Create Shipment Invoice?" is checked. Amount and the
 * Total Weight / Total Amount footer are derived client-side, not user-editable.
 */
export default function InvoiceItemsFieldArray({ control, register, watch, setValue, boxOptions = [] }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'invoice.items' });
  const items = watch('invoice.items') || [];

  const recalcAmount = (index) => {
    const quantity = Number(watch(`invoice.items.${index}.quantity`)) || 0;
    const unitRate = Number(watch(`invoice.items.${index}.unitRate`)) || 0;
    setValue(`invoice.items.${index}.amount`, Number((quantity * unitRate).toFixed(2)));
  };

  const totalWeight = items.reduce((sum, it) => sum + (Number(it?.quantity) || 0) * (Number(it?.unitWeight) || 0), 0);
  const totalAmount = items.reduce((sum, it) => sum + (Number(it?.amount) || 0), 0);

  return (
    <div>
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th>Box No</th>
              <th>Sr No</th>
              <th>Description</th>
              <th>HS Code</th>
              <th>Unit Type</th>
              <th>Quantity</th>
              <th>Unit Weight</th>
              <th>IGST %</th>
              <th>Unit Rate</th>
              <th>Amount</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td>
                  {boxOptions.length > 0 ? (
                    <select className="form-control" {...register(`invoice.items.${index}.boxNo`)}>
                      <option value="">—</option>
                      {boxOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="form-control" {...register(`invoice.items.${index}.boxNo`)} />
                  )}
                </td>
                <td>
                  <input className="form-control" readOnly value={index + 1} onChange={() => {}} />
                </td>
                <td>
                  <input className="form-control" placeholder="Search here…" {...register(`invoice.items.${index}.description`)} />
                </td>
                <td>
                  <input className="form-control" {...register(`invoice.items.${index}.hsCode`)} />
                </td>
                <td>
                  <select className="form-control" {...register(`invoice.items.${index}.unitType`)}>
                    {UNIT_TYPE_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`invoice.items.${index}.quantity`)} onBlur={() => recalcAmount(index)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`invoice.items.${index}.unitWeight`)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`invoice.items.${index}.igst`)} />
                </td>
                <td>
                  <input className="form-control" type="number" step="0.01" {...register(`invoice.items.${index}.unitRate`)} onBlur={() => recalcAmount(index)} />
                </td>
                <td>
                  <input className="form-control" readOnly {...register(`invoice.items.${index}.amount`)} />
                </td>
                <td>
                  <button type="button" className="btn btn-ghost btn-sm btn-icon-only" onClick={() => remove(index)} aria-label="Remove item">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {fields.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={6} />
                <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{totalWeight.toFixed(2)}</td>
                <td colSpan={2} />
                <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{totalAmount.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 'var(--space-3)' }}
        onClick={() => append({ boxNo: '', description: '', hsCode: '', unitType: 'Pc', quantity: '', unitWeight: '', igst: '', unitRate: '', amount: 0 })}
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
}
