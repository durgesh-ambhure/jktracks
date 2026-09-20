import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { settingsService } from '../../services/generic.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const service = settingsService('company-ledger');

export default function CompanyLedgerPage() {
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', rows: [] });
    try {
      const res = await service.list();
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
      <PageHeader title="Company Ledger" subtitle="Company-level transaction ledger" />
      <DataTable
        columns={[
          { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
          { key: 'particulars', header: 'Particulars' },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
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
