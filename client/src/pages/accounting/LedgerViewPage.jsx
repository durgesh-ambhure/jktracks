import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { accountingService } from '../../services/generic.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ledgerService = accountingService('ledger');

export default function LedgerViewPage() {
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', rows: [] });
    try {
      const res = await ledgerService.list();
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
      <PageHeader title="Ledger View" subtitle="Consolidated debit/credit ledger" />
      <DataTable
        columns={[
          { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
          { key: 'particulars', header: 'Particulars' },
          { key: 'debit', header: 'Debit', align: 'right', render: (r) => formatCurrency(r.debit) },
          { key: 'credit', header: 'Credit', align: 'right', render: (r) => formatCurrency(r.credit) },
          { key: 'balance', header: 'Balance', align: 'right', render: (r) => formatCurrency(r.balance) },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No ledger entries yet"
      />
    </div>
  );
}
