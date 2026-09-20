import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import UserForm from '../../components/users/UserForm';
import userService from '../../services/user.service';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await userService.create(values);
      navigate(`/users/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="New User" breadcrumb={[{ label: 'Users', to: '/users' }, { label: 'New User' }]} />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card"><div className="card__body">
        <UserForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create User" onCancel={() => navigate('/users')} />
      </div></div>
    </div>
  );
}
