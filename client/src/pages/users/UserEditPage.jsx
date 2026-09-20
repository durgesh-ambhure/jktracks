import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import UserForm from '../../components/users/UserForm';
import userService from '../../services/user.service';

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await userService.get(id);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError('');
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    try {
      await userService.update(id, payload);
      navigate(`/users/${id}`);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingSpinner label="Loading user…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <div>
      <PageHeader title={`Edit — ${state.data.name}`} breadcrumb={[{ label: 'Users', to: '/users' }, { label: state.data.name, to: `/users/${id}` }, { label: 'Edit' }]} />
      {submitError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{submitError}</div>}
      <div className="card"><div className="card__body">
        <UserForm defaultValues={{ ...state.data, password: '' }} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save Changes" onCancel={() => navigate(`/users/${id}`)} isEdit />
      </div></div>
    </div>
  );
}
