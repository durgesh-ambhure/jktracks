import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { manifestsService } from '../../services/generic.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatDate } from '../../utils/formatters';

export default function TransferManifestListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('manifests.create');
  const canDelete = usePermission('manifests.delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await manifestsService.list({ search: debouncedSearch, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await manifestsService.remove(deleteTarget._id);
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
    { key: 'manifestNo', header: 'Manifest No', render: (r) => r.data?.manifestNo || r.label || '-' },
    { key: 'manifestDate', header: 'Manifest Date', render: (r) => (r.data?.manifestDate ? formatDate(r.data.manifestDate) : '-') },
    { key: 'originHub', header: 'Origin Hub', render: (r) => r.data?.originHub || '-' },
    { key: 'destHub', header: 'Destination Hub', render: (r) => r.data?.destHub || '-' },
    { key: 'numberOfBags', header: 'No. of Bags', render: (r) => r.data?.numberOfBags ?? '-' },
    { key: 'weight', header: 'Weight', render: (r) => r.data?.weight ?? '-' },
    { key: 'productCode', header: 'Product Code', render: (r) => r.data?.productCode || '-' },
    { key: 'createdAt', header: 'Created Date', render: (r) => formatDate(r.createdAt) },
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
        title="Transfer Manifests"
        breadcrumb={[{ label: 'Manifest' }, { label: 'All Transfer Manifests' }]}
        actions={canCreate && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/manifests/create')}>
            <Plus size={15} /> New Transfer Manifest
          </button>
        )}
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
        emptyTitle="No transfer manifests yet"
        emptyDescription="Create a transfer manifest to group shipments for handover."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Transfer Manifest"
        danger
        loading={deleting}
        message="Delete this transfer manifest? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
