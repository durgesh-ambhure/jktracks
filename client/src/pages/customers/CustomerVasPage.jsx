import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import { clientVasService } from '../../services/rateCard.service';
import customerService from '../../services/customer.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatDate } from '../../utils/formatters';

const emptyForm = { clientId: '', vasName: '', rate: '', status: 'ACTIVE' };

export default function CustomerVasPage() {
  const canUpdate = usePermission('customers.update');
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
      const res = await clientVasService.list({ page, limit });
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
      await clientVasService.create(form);
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
      await clientVasService.remove(deleteTarget._id);
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
    { key: 'vasName', header: 'Service', render: (r) => r.vasName },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => (r.rate ? r.rate : 'Included') },
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
        title="Client VAS Detail"
        breadcrumb={[{ label: 'Clients', to: '/customers' }, { label: 'VAS Detail' }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add VAS</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No value-added services assigned yet"
        emptyDescription="Assign a value-added service (e.g. Insurance, ODA Delivery) to a client."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Client VAS"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="client-vas-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="client-vas-form" onSubmit={handleSave}>
          <FormSelect label="Client" required options={clientOptions} value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} />
          <div className="form-grid">
            <FormInput label="Service Name" required placeholder="e.g. Insurance, ODA Delivery" value={form.vasName} onChange={(e) => setForm((f) => ({ ...f, vasName: e.target.value }))} />
            <FormInput label="Rate" type="number" step="0.01" hint="Leave blank if included at no extra charge" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} />
          </div>
          <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Client VAS"
        danger
        loading={deleting}
        message="Delete this value-added service assignment? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
