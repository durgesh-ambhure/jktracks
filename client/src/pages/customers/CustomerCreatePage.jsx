import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CustomerForm from '../../components/customer/CustomerForm';
import customerService from '../../services/customer.service';

export default function CustomerCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await customerService.create(values);
      navigate(`/customers/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Client" breadcrumb={[{ label: 'Clients', to: '/customers' }, { label: 'New Client' }]} />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card"><div className="card__body">
        <CustomerForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Client" onCancel={() => navigate('/customers')} />
      </div></div>
    </div>
  );
}
