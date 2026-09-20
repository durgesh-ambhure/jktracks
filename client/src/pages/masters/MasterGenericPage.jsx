import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormInput from '../../components/common/FormInput';
import { mastersService } from '../../services/generic.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { titleCase } from '../../utils/formatters';

/**
 * Generic Tier-2 list + create screen reused across all Master routes (Zone, Charge Type,
 * Country/State/City, PinCode, ODA mapping, Tracking Event mapping, Reason, HSN), per
 * CONTRACT.md's "generic CRUD against a loosely-typed Mongoose model per key" guidance.
 */
export default function MasterGenericPage({ masterKey, title, fields }) {
  const service = mastersService(masterKey);
  const canUpdate = usePermission('masters.update');
  const canDelete = usePermission('masters.delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await service.list({ search: debouncedSearch, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey, debouncedSearch, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({});
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await service.create(form);
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
      await service.remove(deleteTarget._id);
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
    ...fields.map((f) => ({ key: f, header: titleCase(f), render: (r) => r[f] ?? '-' })),
    canDelete && {
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
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Record</button>}
      />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 320 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search…" />
      </div>

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No records yet"
        emptyDescription={`Add the first ${title.toLowerCase()} record.`}
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
            <button type="submit" form="master-create-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="master-create-form" onSubmit={handleSave}>
          {fields.map((f) => (
            <FormInput
              key={f}
              label={titleCase(f)}
              value={form[f] || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
            />
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Record"
        danger
        loading={deleting}
        message="Delete this record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
