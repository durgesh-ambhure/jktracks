import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { invoicesService } from '../../services/generic.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await invoicesService.get(id);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Loading invoice…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const inv = state.data || {};

  return (
    <div>
      <PageHeader
        title={inv.invoiceNo || `Invoice ${id}`}
        breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: inv.invoiceNo || id }]}
        actions={<button type="button" className="btn btn-secondary" onClick={() => navigate(`/invoices/print/${id}`)}><Printer size={15} /> Print</button>}
      />
      <div className="card">
        <div className="card__body grid-3">
          <div><p className="text-xs text-muted">Client</p><p className="fw-medium">{inv.clientName || inv.client || '-'}</p></div>
          <div><p className="text-xs text-muted">Date</p><p className="fw-medium">{formatDate(inv.invoiceDate || inv.createdAt)}</p></div>
          <div><p className="text-xs text-muted">Amount</p><p className="fw-medium">{formatCurrency(inv.amount)}</p></div>
        </div>
      </div>
    </div>
  );
}
