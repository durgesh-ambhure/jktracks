import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import CourierForm from '../../components/courier/CourierForm';
import courierService from '../../services/courier.service';

export default function CourierEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await courierService.get(id);
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
    if (!payload.apiKey) delete payload.apiKey; // don't overwrite stored key with blank
    try {
      await courierService.update(id, payload);
      navigate(`/couriers/${id}`);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingSpinner label="Loading vendor…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <div>
      <PageHeader title={`Edit — ${state.data.name}`} breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: state.data.name, to: `/couriers/${id}` }, { label: 'Edit' }]} />
      {submitError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{submitError}</div>}
      <div className="card"><div className="card__body">
        <CourierForm
          defaultValues={{ ...state.data, apiKey: '' }}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/couriers/${id}`)}
          isEdit
          hasApiKey={state.data.hasApiKey !== false}
        />
      </div></div>
    </div>
  );
}
