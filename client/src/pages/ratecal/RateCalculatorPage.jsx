import { useState } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import DataTable from '../../components/common/DataTable';
import { ratecalService } from '../../services/rateCard.service';
import { formatCurrency } from '../../utils/formatters';

/**
 * Real comparison over RateCard + VendorFuelSurcharge records (server/src/controllers/
 * ratecalController.js) — for a zone + weight, returns every vendor whose rate card covers it,
 * cheapest first. Depends on rate cards actually being entered via Vendor Rate Entry / Vendor
 * Fuel Surcharge first — an empty result here means no matching rate card exists yet, not a
 * broken calculator.
 */
export default function RateCalculatorPage() {
  const [zone, setZone] = useState('');
  const [weight, setWeight] = useState('');
  const [state, setState] = useState({ loading: false, error: '', searched: false, results: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zone.trim() || !weight) return;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await ratecalService.compare(zone.trim(), Number(weight));
      setState({ loading: false, error: '', searched: true, results: res.data?.results || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, searched: true, results: [] });
    }
  };

  return (
    <div>
      <PageHeader title="Customer Rate Compare" breadcrumb={[{ label: 'Rate Cals' }, { label: 'Customer Rate Compare' }]} subtitle="Compare vendor rates for a zone and weight" />

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body">
          <form onSubmit={handleSubmit} className="form-grid-3">
            <FormInput label="Zone" required value={zone} onChange={(e) => setZone(e.target.value.toUpperCase())} placeholder="e.g. NORTH" />
            <FormInput label="Weight (kg)" type="number" step="0.01" required value={weight} onChange={(e) => setWeight(e.target.value)} />
            <div className="form-field" style={{ justifyContent: 'flex-end' }}>
              <label className="form-label">&nbsp;</label>
              <button type="submit" className="btn btn-primary" disabled={state.loading}>
                <Search size={15} /> {state.loading ? 'Comparing…' : 'Compare Rates'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {state.error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{state.error}</div>}

      {state.searched && !state.error && (
        <DataTable
          columns={[
            { key: 'vendorName', header: 'Vendor', render: (r) => `${r.vendorCode} — ${r.vendorName}` },
            { key: 'serviceType', header: 'Service', render: (r) => r.serviceType || '-' },
            { key: 'baseRate', header: 'Base Rate', align: 'right', render: (r) => formatCurrency(r.baseRate, r.currency) },
            { key: 'fuelSurchargePercent', header: 'Fuel %', align: 'right', render: (r) => `${r.fuelSurchargePercent}%` },
            { key: 'fuelAmount', header: 'Fuel Amount', align: 'right', render: (r) => formatCurrency(r.fuelAmount, r.currency) },
            { key: 'total', header: 'Total', align: 'right', render: (r) => <strong>{formatCurrency(r.total, r.currency)}</strong> },
          ]}
          rows={state.results}
          keyField="vendorId"
          emptyTitle="No vendor rate covers this zone/weight"
          emptyDescription="Add a rate card for this zone under Vendor Rate Entry, or a fuel surcharge under Vendor Fuel Surcharge."
        />
      )}
    </div>
  );
}
