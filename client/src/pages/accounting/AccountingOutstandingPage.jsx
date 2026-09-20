import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { accountingService } from '../../services/generic.service';
import { formatCurrency } from '../../utils/formatters';

const outstandingService = accountingService('client-outstanding');

export default function AccountingOutstandingPage() {
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', rows: [] });
    try {
      const res = await outstandingService.list();
      setState({ loading: false, error: '', rows: res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Client Outstanding (Accounting)" subtitle="Outstanding balances from the accounting ledger" />
      <DataTable
        columns={[
          { key: 'client', header: 'Client', render: (r) => r.clientName || r.client || '-' },
          { key: 'outstanding', header: 'Outstanding', align: 'right', render: (r) => formatCurrency(r.outstanding) },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No outstanding balances"
      />
    </div>
  );
}
