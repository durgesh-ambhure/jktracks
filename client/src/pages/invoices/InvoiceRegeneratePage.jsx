import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import invoiceService from '../../services/invoice.service';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoiceRegeneratePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [state, setState] = useState({ loading: true, error: '', rows: [] });
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await invoiceService.list({ search: debouncedSearch, status: 'GENERATED', limit: 50 });
      setState({ loading: false, error: '', rows: res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const openConfirm = (invoice) => {
    setTarget(invoice);
    setReason('');
    setSaveError('');
  };

  const confirmRegenerate = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await invoiceService.regenerate(target._id, reason);
      navigate(`/invoices/${res.data.reissued._id}`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Re-Generate Client Bill" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Re-Generate Client Bill' }]} subtitle="Void an existing invoice and reissue a fresh one over the same client/date range" />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice no…" />
      </div>

      <DataTable
        columns={[
          { key: 'invoiceNo', header: 'Invoice No', render: (r) => r.invoiceNo },
          { key: 'client', header: 'Client', render: (r) => r.clientId?.name || '-' },
          { key: 'invoiceType', header: 'Type', render: (r) => r.invoiceType },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'invoiceDate', header: 'Date', render: (r) => formatDate(r.invoiceDate) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions', header: '', align: 'right',
            render: (r) => (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => openConfirm(r)}>
                <RefreshCw size={14} /> Void &amp; Reissue
              </button>
            ),
          },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No generated invoices found"
        emptyDescription="Only invoices with status GENERATED can be voided and reissued."
      />

      <ConfirmDialog
        open={Boolean(target)}
        title="Void &amp; Reissue Invoice"
        danger
        loading={saving}
        message={
          <div>
            <p>This voids <strong>{target?.invoiceNo}</strong> and generates a new invoice over the same client and date range. This cannot be undone.</p>
            {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-3)' }}>{saveError}</div>}
            <textarea className="form-control" rows={2} placeholder="Reason for void & reissue" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        }
        confirmLabel="Void & Reissue"
        onConfirm={confirmRegenerate}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
