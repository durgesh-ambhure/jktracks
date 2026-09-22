import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormInput from '../../components/common/FormInput';
import PermissionMatrix from '../../components/users/PermissionMatrix';
import { createGenericService } from '../../services/generic.service';
import { usePermission } from '../../hooks/usePermission';

const rolesService = createGenericService('/roles');

/**
 * Real custom-group management — Role.js no longer restricts `name` to the 5 seeded roles
 * (isSystem: true, protected from delete/rename); this page creates/deletes the custom ones.
 * Editing an existing group's permissions still happens on Group Rights (any role, including
 * custom ones created here, since that page already lists roles dynamically).
 */
export default function UserGroupPage() {
  const canUpdate = usePermission('users.update');
  const [state, setState] = useState({ loading: true, error: '', rows: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await rolesService.list();
      setState({ loading: false, error: '', rows: res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setName('');
    setPermissions([]);
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await rolesService.create({ name, permissions });
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
    setDeleteError('');
    try {
      await rolesService.remove(deleteTarget.name);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Group Name', render: (r) => r.name },
    { key: 'type', header: 'Type', render: (r) => <span className={`badge badge-${r.isSystem ? 'blue' : 'green'}`}>{r.isSystem ? 'System' : 'Custom'}</span> },
    { key: 'permissions', header: 'Permissions', render: (r) => (r.name === 'SUPER_ADMIN' ? 'All (implicit)' : `${r.permissions?.length || 0} granted`) },
    canUpdate && {
      key: 'actions', header: '', align: 'right',
      render: (r) => !r.isSystem && (
        <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => { setDeleteTarget(r); setDeleteError(''); }}>
          <Trash2 size={15} />
        </button>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="User Group"
        subtitle="Custom permission groups beyond the seeded roles"
        actions={canUpdate && <button type="button" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Group</button>}
      />

      <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
        The 5 system roles (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER) can&apos;t be renamed or deleted here.
        Edit any group&apos;s permissions — including custom ones created below — on the Group Rights page.
      </div>

      <DataTable
        columns={columns}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="name"
        emptyTitle="No groups"
        emptyDescription="Create a custom permission group."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New User Group"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="user-group-form" className="btn btn-primary" disabled={saving || !name.trim()}>{saving ? 'Creating…' : 'Create Group'}</button>
          </>
        }
      >
        {saveError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{saveError}</div>}
        <form id="user-group-form" onSubmit={handleSave}>
          <FormInput label="Group Name" required value={name} onChange={(e) => setName(e.target.value.toUpperCase())} hint="Will be stored upper-cased, e.g. DISPATCH_TEAM" />
          <p className="form-label" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>Initial Permissions</p>
          <PermissionMatrix value={permissions} onChange={setPermissions} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Group"
        danger
        loading={deleting}
        message={
          <div>
            <p>Delete group <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
            {deleteError && <div className="alert alert-danger" style={{ marginTop: 'var(--space-3)' }}>{deleteError}</div>}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
