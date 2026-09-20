import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { usePermission } from '../../hooks/usePermission';
import userService from '../../services/user.service';
import { formatDateTime } from '../../utils/formatters';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpdate = usePermission('users.update');
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await userService.get(id);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Loading user…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const u = state.data;

  return (
    <div>
      <PageHeader
        title={u.name}
        breadcrumb={[{ label: 'Users', to: '/users' }, { label: u.name }]}
        subtitle={<StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />}
        actions={canUpdate && <button type="button" className="btn btn-secondary" onClick={() => navigate(`/users/${id}/edit`)}><Pencil size={15} /> Edit</button>}
      />
      <div className="card">
        <div className="card__body text-sm">
          <div className="grid-2">
            <div><span className="text-muted">User Code: </span>{u.userCode}</div>
            <div><span className="text-muted">Email: </span>{u.email}</div>
            <div><span className="text-muted">Role: </span><span className="badge badge-blue">{u.role}</span></div>
            <div><span className="text-muted">Company Code: </span>{u.companyCode || '-'}</div>
            <div><span className="text-muted">Last Login: </span>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</div>
            <div><span className="text-muted">Created: </span>{formatDateTime(u.createdAt)}</div>
          </div>
          {u.permissions?.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <p className="text-muted" style={{ marginBottom: 6 }}>Permissions</p>
              <div className="flex flex-wrap gap-1">
                {u.permissions.map((p) => <span key={p} className="badge badge-gray">{p}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
