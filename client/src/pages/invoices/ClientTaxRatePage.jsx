import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import { clientTaxRateService } from '../../services/rateCard.service';
import customerService from '../../services/customer.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatDate } from '../../utils/formatters';

const TAX_TYPES = ['CGST', 'SGST', 'IGST', 'GST'];
const emptyForm = { clientId: '', taxType: 'GST', percentage: '', status: 'ACTIVE' };

export default function ClientTaxRatePage() {
  const canUpdate = usePermission('invoices.update');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    customerService.list({ limit: 200 }).then((res) => setClients(res.data || [])).catch(() => setClients([]));
  }, []);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c._id, label: `${c.clientCode} — ${c.name}` })), [clients]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await clientTaxRateService.list({ page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [page, limit]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await clientTaxRateService.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await clientTaxRateService.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'client', header: 'Client', render: (r) => r.clientId?.name || '-' },
    { key: 'taxType', header: 'Tax Type', render: (r) => r.taxType },
    { key: 'percentage', header: 'Percentage', align: 'right', render: (r) => `${r.percentage}%` },
    { key: 'effectiveFrom', header: 'Effective From', render: (r) => formatDate(r.effectiveFrom) },
    { key: 'status', header: 'Status', render: (r) => <span className={`badge badge-${r.status === 'ACTIVE' ? 'green' : 'gray'}`}>{r.status}</span> },
    canUpdate && {
      key: 'actions', header: '', align: 'right',
      render: (r) => <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>,
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Client Tax Rate"
        breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Client Tax Rate' }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Tax Rate</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No client tax rates yet"
        emptyDescription="Add a tax rate for a client."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Client Tax Rate"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="client-tax-rate-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="client-tax-rate-form" onSubmit={handleSave}>
          <FormSelect label="Client" required options={clientOptions} value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} />
          <div className="form-grid">
            <FormSelect label="Tax Type" required options={TAX_TYPES} value={form.taxType} onChange={(e) => setForm((f) => ({ ...f, taxType: e.target.value }))} />
            <FormInput label="Percentage" type="number" step="0.01" required value={form.percentage} onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))} />
          </div>
          <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tax Rate"
        danger
        loading={deleting}
        message="Delete this tax rate? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
