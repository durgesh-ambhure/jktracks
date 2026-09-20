import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CourierForm from '../../components/courier/CourierForm';
import courierService from '../../services/courier.service';

export default function CourierCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await courierService.create(values);
      navigate(`/couriers/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Vendor" breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: 'New Vendor' }]} />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card"><div className="card__body">
        <CourierForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Vendor" onCancel={() => navigate('/couriers')} />
      </div></div>
    </div>
  );
}
