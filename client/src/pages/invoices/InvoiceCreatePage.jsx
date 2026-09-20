import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import FormDatePicker from '../../components/common/FormDatePicker';
import { invoicesService } from '../../services/generic.service';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm({ defaultValues: { clientCode: '', fromDate: '', toDate: '' } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await invoicesService.create(values);
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Generate Client Bill" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Generate Client Bill' }]} />
      <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
        Rate calculation engine — placeholder. This generates a bill record against
        /api/v1/invoices from a client + date range; line-item rate lookups are a documented
        Tier-2 TODO.
      </div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-3">
              <FormInput label="Client Code" required {...register('clientCode')} />
              <FormDatePicker label="From Date" required {...register('fromDate')} />
              <FormDatePicker label="To Date" required {...register('toDate')} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Generating…' : 'Generate Bill'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
