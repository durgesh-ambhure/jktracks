import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/common/DataTable';
import invoiceService from '../../services/invoice.service';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpdate = usePermission('invoices.update');
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [regenOpen, setRegenOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState('');

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await invoiceService.get(id);
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

  const confirmRegenerate = async () => {
    setRegenerating(true);
    setRegenError('');
    try {
      const res = await invoiceService.regenerate(id, reason);
      setRegenOpen(false);
      navigate(`/invoices/${res.data.reissued._id}`);
    } catch (err) {
      setRegenError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={inv.invoiceNo || `Invoice ${id}`}
        breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: inv.invoiceNo || id }]}
        subtitle={<StatusBadge status={inv.status || 'GENERATED'} />}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/invoices/print/${id}`)}><Printer size={15} /> Print</button>
            {canUpdate && inv.status === 'GENERATED' && (
              <button type="button" className="btn btn-secondary" onClick={() => setRegenOpen(true)}><RefreshCw size={15} /> Void &amp; Reissue</button>
            )}
          </>
        }
      />

      {inv.status === 'VOIDED' && inv.voidedInvoiceId && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
          This invoice was voided ({inv.voidReason || 'no reason given'}) and reissued as{' '}
          <a href={`/invoices/${inv.voidedInvoiceId}`} onClick={(e) => { e.preventDefault(); navigate(`/invoices/${inv.voidedInvoiceId}`); }}>a new invoice</a>.
        </div>
      )}
      {inv.regeneratedFromId && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
          This invoice was reissued from a voided invoice.
        </div>
      )}

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body grid-4">
          <div><p className="text-xs text-muted">Client</p><p className="fw-medium">{inv.clientId?.name || '-'}</p></div>
          <div><p className="text-xs text-muted">Type</p><p className="fw-medium">{inv.invoiceType || 'STANDARD'}</p></div>
          <div><p className="text-xs text-muted">Date</p><p className="fw-medium">{formatDate(inv.invoiceDate || inv.createdAt)}</p></div>
          <div><p className="text-xs text-muted">Period</p><p className="fw-medium">{formatDate(inv.fromDate)} – {formatDate(inv.toDate)}</p></div>
          <div><p className="text-xs text-muted">Sub Total</p><p className="fw-medium">{formatCurrency(inv.subTotal)}</p></div>
          <div><p className="text-xs text-muted">Tax Amount</p><p className="fw-medium">{formatCurrency(inv.taxAmount)}</p></div>
          <div><p className="text-xs text-muted">Total Amount</p><p className="fw-medium">{formatCurrency(inv.amount)}</p></div>
        </div>
      </div>

      {inv.taxBreakup?.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="card__header"><h3 className="card__title">Tax Breakup</h3></div>
          <div className="card__body text-sm">
            <div className="grid-3">
              {inv.taxBreakup.map((t) => (
                <div key={t.taxType}><span className="text-muted">{t.taxType} ({t.percentage}%): </span>{formatCurrency(t.amount)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__header"><h3 className="card__title">Line Items</h3></div>
        <DataTable
          columns={[
            { key: 'awbNo', header: 'AWB No', render: (r) => r.awbNo },
            { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          ]}
          rows={inv.lineItems || []}
          keyField="awbNo"
          emptyTitle="No line items"
          emptyDescription="This invoice has no shipment line items."
        />
      </div>

      <ConfirmDialog
        open={regenOpen}
        title="Void &amp; Reissue Invoice"
        danger
        loading={regenerating}
        message={
          <div>
            <p>This voids <strong>{inv.invoiceNo}</strong> and generates a new invoice over the same client and date range. This cannot be undone.</p>
            {regenError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-3)' }}>{regenError}</div>}
            <textarea className="form-control" rows={2} placeholder="Reason for void & reissue" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        }
        confirmLabel="Void & Reissue"
        onConfirm={confirmRegenerate}
        onCancel={() => setRegenOpen(false)}
      />
    </div>
  );
}
