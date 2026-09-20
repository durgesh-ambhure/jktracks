import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../common/FormInput';
import FormDatePicker from '../common/FormDatePicker';
import { accountingService } from '../../services/generic.service';
import { toInputDate } from '../../utils/formatters';

export default function AccountingEntryForm({ entryKey, particularsLabel = 'Particulars' }) {
  const service = accountingService(entryKey);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: toInputDate(new Date()), particulars: '', debit: '', credit: '', reference: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await service.create(values);
      setMessage({ type: 'success', text: 'Entry saved.' });
      reset({ date: toInputDate(new Date()), particulars: '', debit: '', credit: '', reference: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card__body">
        {message && <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormDatePicker label="Date" required {...register('date')} />
            <FormInput label="Reference No" {...register('reference')} />
          </div>
          <FormInput label={particularsLabel} required {...register('particulars')} />
          <div className="form-grid">
            <FormInput label="Debit" type="number" step="0.01" {...register('debit')} />
            <FormInput label="Credit" type="number" step="0.01" {...register('credit')} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
