import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { invoicesService } from '../../services/generic.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoicePrintPage() {
  const { id } = useParams();
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
        title="Invoice Print Preview"
        actions={<button type="button" className="btn btn-primary" onClick={() => window.print()}><Printer size={15} /> Print</button>}
      />
      <div className="card">
        <div className="card__body">
          <div className="flex justify-between" style={{ marginBottom: 'var(--space-5)' }}>
            <h2>{inv.invoiceNo || `Invoice ${id}`}</h2>
            <p>{formatDate(inv.invoiceDate || inv.createdAt)}</p>
          </div>
          <p><strong>Bill To:</strong> {inv.clientName || inv.client || '-'}</p>
          <p><strong>Amount:</strong> {formatCurrency(inv.amount)}</p>
        </div>
      </div>
    </div>
  );
}
