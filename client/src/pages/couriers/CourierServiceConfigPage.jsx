import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import { vendorServiceConfigService } from '../../services/rateCard.service';
import courierService from '../../services/courier.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';

const emptyForm = { vendorId: '', serviceType: '', enabled: true, priority: 0, cutoffTime: '', notes: '' };

export default function CourierServiceConfigPage() {
  const canUpdate = usePermission('couriers.update');
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
  const selectedVendor = vendors.find((v) => v._id === form.vendorId);
  const serviceTypeOptions = useMemo(
    () => (selectedVendor?.serviceTypes || []).map((s) => s.name || s.code).filter(Boolean),
    [selectedVendor]
  );

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await vendorServiceConfigService.list({ page, limit });
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
      await vendorServiceConfigService.create(form);
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
      await vendorServiceConfigService.remove(deleteTarget._id);
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
    { key: 'serviceType', header: 'Service Type', render: (r) => r.serviceType },
    { key: 'enabled', header: 'Enabled', render: (r) => <span className={`badge badge-${r.enabled ? 'green' : 'gray'}`}>{r.enabled ? 'Yes' : 'No'}</span> },
    { key: 'priority', header: 'Priority', align: 'right', render: (r) => r.priority },
    { key: 'cutoffTime', header: 'Cutoff Time', render: (r) => r.cutoffTime || '-' },
    canUpdate && {
      key: 'actions', header: '', align: 'right',
      render: (r) => <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>,
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Vendor Service Configuration"
        breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: 'Service Configuration' }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Configuration</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No service configurations yet"
        emptyDescription="Enable and prioritize a vendor's service types for booking."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Service Configuration"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="service-config-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="service-config-form" onSubmit={handleSave}>
          <FormSelect label="Vendor" required options={vendorOptions} value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value, serviceType: '' }))} />
          {serviceTypeOptions.length > 0 ? (
            <FormSelect label="Service Type" required options={serviceTypeOptions} value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} />
          ) : (
            <FormInput label="Service Type" required hint="This vendor has no declared service types — enter one manually" value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} />
          )}
          <div className="form-grid">
            <FormInput label="Priority" type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} />
            <FormInput label="Cutoff Time" placeholder="18:00" value={form.cutoffTime} onChange={(e) => setForm((f) => ({ ...f, cutoffTime: e.target.value }))} />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 'var(--space-3)' }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} /> Enabled for booking
          </label>
          <div className="form-field">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service Configuration"
        danger
        loading={deleting}
        message="Delete this service configuration? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
