import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import invoiceService from '../../services/invoice.service';
import customerService from '../../services/customer.service';

export default function TopayInvoicePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { clientId: '', fromDate: '', toDate: '' } });

  useEffect(() => {
    customerService.list({ limit: 200 }).then((res) => setClients(res.data || [])).catch(() => setClients([]));
  }, []);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c._id, label: `${c.clientCode} — ${c.name}` })), [clients]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await invoiceService.create({ ...values, invoiceType: 'TOPAY' });
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Cash / ToPay Invoice" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Cash/ToPay Invoice' }]} />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-3">
              <FormSelect label="Client" required options={clientOptions} error={errors.clientId?.message} {...register('clientId', { required: 'Client is required' })} />
              <FormDatePicker label="From Date" required error={errors.fromDate?.message} {...register('fromDate', { required: 'From date is required' })} />
              <FormDatePicker label="To Date" required error={errors.toDate?.message} {...register('toDate', { required: 'To date is required' })} />
            </div>
            <p className="form-hint">Covers Cash and COD shipments for this client booked in the date range.</p>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Generating…' : 'Generate Invoice'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
