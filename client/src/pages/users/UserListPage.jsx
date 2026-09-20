import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import userService from '../../services/user.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';

export default function UserListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('users.create');
  const canUpdate = usePermission('users.update');
  const canDelete = usePermission('users.delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await userService.list({ search: debouncedSearch, page, limit });
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
      await userService.remove(deleteTarget._id);
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
    { key: 'userCode', header: 'User Code' },
    { key: 'name', header: 'Name', render: (r) => <a href={`/users/${r._id}`} onClick={(e) => { e.preventDefault(); navigate(`/users/${r._id}`); }}>{r.name}</a> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <span className="badge badge-blue">{r.role}</span> },
    { key: 'isActive', header: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="View" onClick={() => navigate(`/users/${r._id}`)}><Eye size={15} /></button>
          {canUpdate && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Edit" onClick={() => navigate(`/users/${r._id}/edit`)}><Pencil size={15} /></button>}
          {canDelete && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and role assignments"
        actions={canCreate && <button type="button" className="btn btn-primary" onClick={() => navigate('/users/create')}><Plus size={15} /> New User</button>}
      />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email…" />
      </div>

      <DataTable columns={columns} rows={state.rows} loading={state.loading} error={state.error} onRetry={load} keyField="_id" emptyTitle="No users found" emptyDescription="Add your first user to get started." />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete User"
        danger
        loading={deleting}
        message={`Delete user "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
