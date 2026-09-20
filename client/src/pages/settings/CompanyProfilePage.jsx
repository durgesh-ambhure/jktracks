import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { settingsService } from '../../services/generic.service';

const service = settingsService('company-profile');

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { companyName: '', gstin: '', address: '', phone: '', email: '', website: '' },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await service.list();
        const record = (res.data || [])[0];
        if (record) {
          setRecordId(record._id);
          reset(record);
        }
      } catch {
        /* first-time setup — form stays at defaults */
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setMessage(null);
    try {
      if (recordId) await service.update(recordId, values);
      else {
        const res = await service.create(values);
        setRecordId(res.data._id);
      }
      setMessage({ type: 'success', text: 'Company profile saved.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading company profile…" full />;

  return (
    <div>
      <PageHeader title="Company Profile" subtitle="Your organization's registered details" />
      <div className="card">
        <div className="card__body">
          {message && <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--space-4)' }}>{message.text}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <FormInput label="Company Name" required {...register('companyName')} />
              <FormInput label="GSTIN" {...register('gstin')} />
            </div>
            <FormInput label="Address" {...register('address')} />
            <div className="form-grid-3">
              <FormInput label="Phone" {...register('phone')} />
              <FormInput label="Email" type="email" {...register('email')} />
              <FormInput label="Website" {...register('website')} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}><Save size={15} /> {submitting ? 'Saving…' : 'Save Profile'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
