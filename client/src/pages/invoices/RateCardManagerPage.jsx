import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import { rateCardService } from '../../services/rateCard.service';
import courierService from '../../services/courier.service';
import customerService from '../../services/customer.service';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { CURRENCY_OPTIONS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

const emptyForm = {
  zone: '', serviceType: '', weightFrom: '', weightTo: '', baseRate: '',
  additionalRatePerKg: '', currency: 'INR', status: 'ACTIVE',
};

/**
 * Shared rate-card CRUD screen for both "Vendor Rate Entry" (partyType VENDOR — what we pay
 * the vendor) and "Client Rate Entry" (partyType CLIENT — what we charge the client). Real
 * data, backed by RateCard.js — not a GenericRecord placeholder.
 */
export default function RateCardManagerPage({ partyType, title }) {
  const canUpdate = usePermission('invoices.update');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [parties, setParties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [partyId, setPartyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const partyField = partyType === 'VENDOR' ? 'vendorId' : 'clientId';

  useEffect(() => {
    const service = partyType === 'VENDOR' ? courierService : customerService;
    service.list({ limit: 200 }).then((res) => setParties(res.data || [])).catch(() => setParties([]));
  }, [partyType]);

  const partyOptions = useMemo(
    () => parties.map((p) => ({ value: p._id, label: partyType === 'VENDOR' ? `${p.vendorCode} — ${p.name}` : `${p.clientCode} — ${p.name}` })),
    [parties, partyType]
  );

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await rateCardService.list({ partyType, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [partyType, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setPartyId('');
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await rateCardService.create({ partyType, [partyField]: partyId, ...form });
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
      await rateCardService.remove(deleteTarget._id);
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
    { key: 'party', header: partyType === 'VENDOR' ? 'Vendor' : 'Client', render: (r) => r[partyField]?.name || '-' },
    { key: 'zone', header: 'Zone', render: (r) => r.zone },
    { key: 'serviceType', header: 'Service', render: (r) => r.serviceType || '-' },
    { key: 'weightRange', header: 'Weight Range (kg)', render: (r) => `${r.weightFrom} – ${r.weightTo}` },
    { key: 'baseRate', header: 'Base Rate', align: 'right', render: (r) => formatCurrency(r.baseRate, r.currency) },
    { key: 'additionalRatePerKg', header: 'Add’l /kg', align: 'right', render: (r) => formatCurrency(r.additionalRatePerKg, r.currency) },
    { key: 'effectiveFrom', header: 'Effective From', render: (r) => formatDate(r.effectiveFrom) },
    { key: 'status', header: 'Status', render: (r) => <span className={`badge badge-${r.status === 'ACTIVE' ? 'green' : 'gray'}`}>{r.status}</span> },
    canUpdate && {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}>
          <Trash2 size={15} />
        </button>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title={title}
        breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: title }]}
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Rate</button>}
      />

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No rate cards yet"
        emptyDescription={`Add the first ${partyType === 'VENDOR' ? 'vendor' : 'client'} rate.`}
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add ${title}`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="rate-card-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="rate-card-form" onSubmit={handleSave}>
          <FormSelect label={partyType === 'VENDOR' ? 'Vendor' : 'Client'} required options={partyOptions} value={partyId} onChange={(e) => setPartyId(e.target.value)} />
          <div className="form-grid">
            <FormInput label="Zone" required value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value.toUpperCase() }))} />
            <FormInput label="Service Type" value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} />
          </div>
          <div className="form-grid">
            <FormInput label="Weight From (kg)" type="number" step="0.01" required value={form.weightFrom} onChange={(e) => setForm((f) => ({ ...f, weightFrom: e.target.value }))} />
            <FormInput label="Weight To (kg)" type="number" step="0.01" required value={form.weightTo} onChange={(e) => setForm((f) => ({ ...f, weightTo: e.target.value }))} />
          </div>
          <div className="form-grid">
            <FormInput label="Base Rate" type="number" step="0.01" required value={form.baseRate} onChange={(e) => setForm((f) => ({ ...f, baseRate: e.target.value }))} />
            <FormInput label="Additional Rate / kg" hint="Applied beyond Weight To" type="number" step="0.01" value={form.additionalRatePerKg} onChange={(e) => setForm((f) => ({ ...f, additionalRatePerKg: e.target.value }))} />
          </div>
          <div className="form-grid">
            <FormSelect label="Currency" options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
            <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Rate Card"
        danger
        loading={deleting}
        message="Delete this rate card? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
