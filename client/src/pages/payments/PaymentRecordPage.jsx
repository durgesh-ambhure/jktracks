import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import { paymentsService } from '../../services/generic.service';
import { toInputDate } from '../../utils/formatters';

const METHOD_OPTIONS = ['CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI', 'CARD'];

export default function PaymentRecordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm({
    defaultValues: { invoiceNo: '', amount: '', method: 'NEFT', paidOn: toInputDate(new Date()), reference: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      await paymentsService.create(values);
      navigate('/payments');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Record Payment" breadcrumb={[{ label: 'Payments', to: '/payments' }, { label: 'Record Payment' }]} />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-3">
              <FormInput label="Invoice No" required {...register('invoiceNo')} />
              <FormInput label="Amount" type="number" step="0.01" required {...register('amount')} />
              <FormSelect label="Method" options={METHOD_OPTIONS} {...register('method')} />
            </div>
            <div className="form-grid">
              <FormDatePicker label="Paid On" required {...register('paidOn')} />
              <FormInput label="Reference / UTR No" {...register('reference')} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/payments')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Record Payment'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
