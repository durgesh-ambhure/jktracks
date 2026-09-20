import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import FilterPanel from '../../components/common/FilterPanel';
import FormDatePicker from '../../components/common/FormDatePicker';
import DataTable from '../../components/common/DataTable';
import reportService from '../../services/report.service';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function VendorContributionPage() {
  const [filters, setFilters] = useState({ fromDate: '', toDate: '' });
  const [applied, setApplied] = useState(filters);
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = { ...applied };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await reportService.vendorContribution(params);
      setState({ loading: false, error: '', rows: res.data?.rows || res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Vendor Contribution" subtitle="Shipment volume and revenue contribution by vendor" />
      <FilterPanel onApply={() => setApplied(filters)} onClear={() => { const c = { fromDate: '', toDate: '' }; setFilters(c); setApplied(c); }}>
        <FormDatePicker label="From Date" value={filters.fromDate} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))} />
        <FormDatePicker label="To Date" value={filters.toDate} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))} />
      </FilterPanel>
      <DataTable
        columns={[
          { key: 'vendor', header: 'Vendor', render: (r) => r.vendorName || r.vendor || '-' },
          { key: 'shipments', header: 'Shipments', align: 'right', render: (r) => formatNumber(r.shipments) },
          { key: 'revenue', header: 'Revenue', align: 'right', render: (r) => formatCurrency(r.revenue) },
          { key: 'share', header: 'Share %', align: 'right', render: (r) => (r.sharePercent != null ? `${r.sharePercent}%` : '-') },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        emptyTitle="No vendor contribution data"
        emptyDescription="This report depends on GET /reports/vendor-contribution, which may not be live on the backend yet."
      />
    </div>
  );
}
