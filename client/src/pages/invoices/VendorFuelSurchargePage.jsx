import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import { vendorFuelSurchargeService } from '../../services/rateCard.service';
import courierService from '../../services/courier.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatDate } from '../../utils/formatters';

const emptyForm = { vendorId: '', percentage: '', status: 'ACTIVE' };

export default function VendorFuelSurchargePage() {
  const canUpdate = usePermission('invoices.update');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [vendors, setVendors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    courierService.list({ limit: 200 }).then((res) => setVendors(res.data || [])).catch(() => setVendors([]));
  }, []);

  const vendorOptions = useMemo(() => vendors.map((v) => ({ value: v._id, label: `${v.vendorCode} — ${v.name}` })), [vendors]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await vendorFuelSurchargeService.list({ page, limit });
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
      await vendorFuelSurchargeService.create(form);
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
      await vendorFuelSurchargeService.remove(deleteTarget._id);
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
    { key: 'vendor', header: 'Vendor', render: (r) => r.vendorId?.name || '-' },
    { key: 'percentage', header: 'Fuel Surcharge %', align: 'right', render: (r) => `${r.percentage}%` },
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
        title="Vendor Fuel Surcharge"
        breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Vendor Fuel Surcharge' }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Surcharge</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No fuel surcharges yet"
        emptyDescription="Add a fuel surcharge percentage for a vendor. Used by the Rate Calculator."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Vendor Fuel Surcharge"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="fuel-surcharge-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="fuel-surcharge-form" onSubmit={handleSave}>
          <FormSelect label="Vendor" required options={vendorOptions} value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} />
          <FormInput label="Fuel Surcharge %" type="number" step="0.01" required value={form.percentage} onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))} />
          <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Fuel Surcharge"
        danger
        loading={deleting}
        message="Delete this fuel surcharge? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
