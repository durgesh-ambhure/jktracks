import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import CustomerForm from '../../components/customer/CustomerForm';
import customerService from '../../services/customer.service';

export default function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await customerService.get(id);
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
    try {
      await customerService.update(id, values);
      navigate(`/customers/${id}`);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingSpinner label="Loading client…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <div>
      <PageHeader title={`Edit — ${state.data.name}`} breadcrumb={[{ label: 'Clients', to: '/customers' }, { label: state.data.name, to: `/customers/${id}` }, { label: 'Edit' }]} />
      {submitError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{submitError}</div>}
      <div className="card"><div className="card__body">
        <CustomerForm defaultValues={state.data} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save Changes" onCancel={() => navigate(`/customers/${id}`)} />
      </div></div>
    </div>
  );
}
