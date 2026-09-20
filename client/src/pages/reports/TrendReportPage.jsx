import { useCallback, useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import FilterPanel from '../../components/common/FilterPanel';
import FormSelect from '../../components/common/FormSelect';
import ChartCard from '../../components/common/ChartCard';
import DataTable from '../../components/common/DataTable';
import customerService from '../../services/customer.service';
import reportService from '../../services/report.service';
import { formatNumber } from '../../utils/formatters';

export default function TrendReportPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [applied, setApplied] = useState('');
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  useEffect(() => {
    customerService.list({ limit: 100 }).then((res) => setClients(res.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = applied ? { clientId: applied } : {};
      const res = await reportService.trend(params);
      setState({ loading: false, error: '', rows: res.data?.rows || res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c._id, label: c.name })), [clients]);

  return (
    <div>
      <PageHeader title="Trend Report" subtitle="Shipment volume trend over the last N months, by client" />
      <FilterPanel onApply={() => setApplied(clientId)} onClear={() => { setClientId(''); setApplied(''); }}>
        <FormSelect label="Client" options={clientOptions} value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </FilterPanel>

      <ChartCard title="Volume Trend" subtitle="Shipment count per month" height={300}>
        {state.rows.length === 0 ? (
          <div className="state-block"><span className="text-sm text-muted">No trend data available</span></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={state.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="shipments" name="Shipments" stroke="#3563e0" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <DataTable
          columns={[
            { key: 'label', header: 'Period' },
            { key: 'shipments', header: 'Shipments', align: 'right', render: (r) => formatNumber(r.shipments) },
            { key: 'change', header: 'Change vs Prior', align: 'right', render: (r) => (r.changePercent != null ? `${r.changePercent > 0 ? '+' : ''}${r.changePercent}%` : '-') },
          ]}
          rows={state.rows}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="No trend data"
          emptyDescription="This report depends on GET /reports/trend, which may not be live on the backend yet."
        />
      </div>
    </div>
  );
}
