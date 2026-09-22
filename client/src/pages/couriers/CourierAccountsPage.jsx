import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import { vendorAccountService } from '../../services/rateCard.service';
import courierService from '../../services/courier.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';

const emptyForm = {
  vendorId: '', accountHolderName: '', bankName: '', accountNumber: '',
  ifscCode: '', branchName: '', accountType: 'CURRENT', isPrimary: false, status: 'ACTIVE',
};

export default function CourierAccountsPage() {
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

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await vendorAccountService.list({ page, limit });
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
      await vendorAccountService.create(form);
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
      await vendorAccountService.remove(deleteTarget._id);
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
    { key: 'accountHolderName', header: 'Account Holder', render: (r) => r.accountHolderName },
    { key: 'bankName', header: 'Bank', render: (r) => r.bankName },
    { key: 'accountNumber', header: 'Account No', render: (r) => r.accountNumber },
    { key: 'ifscCode', header: 'IFSC', render: (r) => r.ifscCode },
    { key: 'accountType', header: 'Type', render: (r) => r.accountType },
    { key: 'isPrimary', header: 'Primary', render: (r) => (r.isPrimary ? 'Yes' : 'No') },
    { key: 'status', header: 'Status', render: (r) => <span className={`badge badge-${r.status === 'ACTIVE' ? 'green' : 'gray'}`}>{r.status}</span> },
    canUpdate && {
      key: 'actions', header: '', align: 'right',
      render: (r) => <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>,
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Vendor Account Detail"
        breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: 'Account Detail' }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Account</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No vendor accounts yet"
        emptyDescription="Add bank account details for a vendor."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Vendor Account"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="vendor-account-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="vendor-account-form" onSubmit={handleSave}>
          <FormSelect label="Vendor" required options={vendorOptions} value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} />
          <div className="form-grid">
            <FormInput label="Account Holder Name" required value={form.accountHolderName} onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))} />
            <FormInput label="Bank Name" required value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} />
          </div>
          <div className="form-grid">
            <FormInput label="Account Number" required value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} />
            <FormInput label="IFSC Code" required value={form.ifscCode} onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))} />
          </div>
          <div className="form-grid">
            <FormInput label="Branch Name" value={form.branchName} onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))} />
            <FormSelect label="Account Type" options={['SAVINGS', 'CURRENT']} value={form.accountType} onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))} />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 'var(--space-3)' }}>
            <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))} /> Primary account
          </label>
          <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Vendor Account"
        danger
        loading={deleting}
        message="Delete this vendor account? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
