import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatsCard from '../../components/common/StatsCard';
import { AlertCircle } from 'lucide-react';
import reportService from '../../services/report.service';
import { formatCurrency } from '../../utils/formatters';

export default function ClientOutstandingPage() {
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', rows: [] });
    try {
      const res = await reportService.clientOutstanding();
      setState({ loading: false, error: '', rows: res.data?.rows || res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = state.rows.reduce((sum, r) => sum + (Number(r.outstanding) || 0), 0);

  return (
    <div>
      <PageHeader title="Client Outstanding" subtitle="Unpaid invoice balances by client" />
      <div className="grid-3" style={{ marginBottom: 'var(--space-5)' }}>
        <StatsCard label="Total Outstanding" value={formatCurrency(total)} icon={AlertCircle} />
      </div>
      <DataTable
        columns={[
          { key: 'client', header: 'Client', render: (r) => r.clientName || r.client || '-' },
          { key: 'invoices', header: 'Open Invoices', align: 'right' },
          { key: 'outstanding', header: 'Outstanding', align: 'right', render: (r) => formatCurrency(r.outstanding) },
          { key: 'oldestDueDate', header: 'Oldest Due Date', render: (r) => r.oldestDueDate || '-' },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        emptyTitle="No outstanding balances"
        emptyDescription="This report depends on GET /reports/client-outstanding, which may not be live on the backend yet."
      />
    </div>
  );
}
