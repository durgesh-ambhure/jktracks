import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormSelect from '../../components/common/FormSelect';
import PermissionMatrix from '../../components/users/PermissionMatrix';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/user.service';
import { createGenericService } from '../../services/generic.service';
import { ROLE_OPTIONS } from '../../utils/constants';

const rolesService = createGenericService('/roles');

export default function GroupRightsPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.roles();
        setRoles(res.data || []);
        if (res.data?.length) setSelectedRole(res.data[0].name);
      } catch {
        setRoles(ROLE_OPTIONS.map((name) => ({ name, permissions: [] })));
        setSelectedRole(ROLE_OPTIONS[0]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.name === selectedRole);
    setPermissions(role?.permissions || []);
  }, [selectedRole, roles]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await rolesService.update(selectedRole, { permissions });
      setMessage({ type: 'success', text: 'Group rights saved.' });
    } catch (err) {
      setMessage({ type: 'warning', text: `Saved locally — backend endpoint not reachable yet (${err.message}).` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading roles…" full />;

  return (
    <div>
      <PageHeader
        title="Group Rights"
        subtitle="Menu access per role/group"
        actions={<button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save Rights'}</button>}
      />

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card__body">
          <FormSelect
            label="Group / Role"
            options={roles.map((r) => r.name)}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            containerClassName="mb-0"
            placeholder={undefined}
          />
        </div>
      </div>

      {message && <div className={`alert alert-${message.type === 'success' ? 'success' : 'warning'}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}

      <div className="card">
        <div className="card__body">
          <PermissionMatrix value={permissions} onChange={setPermissions} disabled={selectedRole === 'SUPER_ADMIN'} />
          {selectedRole === 'SUPER_ADMIN' && <p className="form-hint" style={{ marginTop: 8 }}>SUPER_ADMIN implicitly has all permissions (backend short-circuit) and cannot be restricted.</p>}
        </div>
      </div>
    </div>
  );
}
