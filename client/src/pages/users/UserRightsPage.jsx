import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormSelect from '../../components/common/FormSelect';
import PermissionMatrix from '../../components/users/PermissionMatrix';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import userService from '../../services/user.service';

export default function UserRightsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.list({ limit: 100 });
      setUsers(res.data || []);
      if (res.data?.length) setSelectedUserId(res.data[0]._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const u = users.find((x) => x._id === selectedUserId);
    setPermissions(u?.permissions || []);
  }, [selectedUserId, users]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await userService.update(selectedUserId, { permissions });
      setMessage({ type: 'success', text: 'User rights saved.' });
      load();
    } catch (err) {
      setMessage({ type: 'warning', text: `Could not persist to backend yet (${err.message}). UI state is preserved.` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading users…" full />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="User Rights"
        subtitle="Menu access override per individual user"
        actions={<button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || !selectedUserId}><Save size={15} /> {saving ? 'Saving…' : 'Save Rights'}</button>}
      />

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card__body">
          <FormSelect
            label="User"
            options={users.map((u) => ({ value: u._id, label: `${u.userCode} — ${u.name}` }))}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            containerClassName="mb-0"
          />
        </div>
      </div>

      {message && <div className={`alert alert-${message.type === 'success' ? 'success' : 'warning'}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}

      <div className="card">
        <div className="card__body">
          <PermissionMatrix value={permissions} onChange={setPermissions} />
        </div>
      </div>
    </div>
  );
}
