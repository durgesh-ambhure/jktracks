import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { paymentsService } from '../../services/generic.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PaymentListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('payments.create');
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
      <PageHeader
        title="Payments"
        subtitle="Payments recorded against invoices"
        actions={canCreate && <button type="button" className="btn btn-primary" onClick={() => navigate('/payments/record')}><Plus size={15} /> Record Payment</button>}
      />
      <DataTable
        columns={[
          { key: 'reference', header: 'Reference', render: (r) => r.reference || r._id },
          { key: 'invoiceNo', header: 'Invoice No' },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'method', header: 'Method' },
          { key: 'paidOn', header: 'Paid On', render: (r) => formatDate(r.paidOn || r.createdAt) },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No payments recorded yet"
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
