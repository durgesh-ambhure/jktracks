import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { paymentsService } from '../../services/generic.service';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function PaymentHistoryPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await paymentsService.list({ page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Payment History" subtitle="Full payment history across all invoices" />
      <DataTable
        columns={[
          { key: 'createdAt', header: 'Recorded At', render: (r) => formatDateTime(r.createdAt) },
          { key: 'invoiceNo', header: 'Invoice No' },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'method', header: 'Method' },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No payment history"
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
