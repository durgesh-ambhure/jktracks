import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Search, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FormSelect from '../../components/common/FormSelect';
import FormInput from '../../components/common/FormInput';
import FormDatePicker from '../../components/common/FormDatePicker';
import StatusBadge from '../../components/common/StatusBadge';
import EventTimeline from '../../components/tracking/EventTimeline';
import shipmentService from '../../services/shipment.service';
import { SHIPMENT_STATUS_OPTIONS, REASON_CODE_OPTIONS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';

const REASON_REQUIRED_STATUSES = ['UN-DELIVERED', 'RTO', 'HOLD AT CUSTOM', 'CANCELLED'];

const schema = Joi.object({
  date: Joi.string().required().messages({ 'string.empty': 'Date is required' }),
  time: Joi.string().required().messages({ 'string.empty': 'Time is required' }),
  status: Joi.string().valid(...SHIPMENT_STATUS_OPTIONS).required().messages({ 'any.only': 'Select a status', 'string.empty': 'Select a status' }),
  reasonCode: Joi.string().allow(''),
  location: Joi.string().required().messages({ 'string.empty': 'Location is required' }),
  statusDetails: Joi.string().allow(''),
});

export default function ShipmentMovementPage() {
  const [awb, setAwb] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: { date: toInputDate(new Date()), time: new Date().toTimeString().slice(0, 5), status: '', reasonCode: '', location: '', statusDetails: '' },
  });
  const status = watch('status');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setSearching(true);
    setSearchError('');
    setShipment(null);
    setSubmitMsg('');
    try {
      const res = await shipmentService.list({ search: awb.trim(), limit: 1 });
      if (res.data?.length) {
        setShipment(res.data[0]);
        try {
          const ev = await shipmentService.listEvents(res.data[0]._id);
          setEvents(ev.data || []);
        } catch {
          setEvents([]);
        }
      } else {
        setSearchError('No shipment found for that AWB number.');
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSubmitMsg('');
    try {
      await shipmentService.addEvent(shipment._id, values);
      setSubmitMsg('success');
      reset({ date: toInputDate(new Date()), time: new Date().toTimeString().slice(0, 5), status: '', reasonCode: '', location: '', statusDetails: '' });
      const ev = await shipmentService.listEvents(shipment._id);
      setEvents(ev.data || []);
    } catch (err) {
      setSubmitMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Shipment Movement" subtitle="Append a tracking event to a shipment's timeline" />

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body">
          <form onSubmit={handleSearch} className="flex gap-2" style={{ maxWidth: 480 }}>
            <SearchInput value={awb} onChange={setAwb} placeholder="Enter AWB number…" />
            <button type="submit" className="btn btn-primary" disabled={searching}><Search size={15} /> Find</button>
          </form>
          {searchError && <p className="form-error" style={{ marginTop: 8 }}>{searchError}</p>}
        </div>
      </div>

      {shipment && (
        <div className="grid-2">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">{shipment.awbNo}</h3>
              <StatusBadge status={shipment.status} />
            </div>
            <div className="card__body">
              {submitMsg === 'success' && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>Event added successfully.</div>}
              {submitMsg && submitMsg !== 'success' && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{submitMsg}</div>}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-grid">
                  <FormDatePicker label="Date" required error={errors.date?.message} {...register('date')} />
                  <FormDatePicker label="Time" type="time" required error={errors.time?.message} {...register('time')} />
                </div>
                <FormSelect label="Status" required options={SHIPMENT_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
                {REASON_REQUIRED_STATUSES.includes(status) && (
                  <FormSelect
                    label="Reason"
                    options={REASON_CODE_OPTIONS.map((r) => ({ value: r.code, label: r.label }))}
                    error={errors.reasonCode?.message}
                    {...register('reasonCode')}
                  />
                )}
                <FormInput label="Location" required error={errors.location?.message} {...register('location')} />
                <div className="form-field">
                  <label className="form-label">Details</label>
                  <textarea className="form-control" rows={3} {...register('statusDetails')} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <Send size={15} /> {submitting ? 'Submitting…' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h3 className="card__title">Current Timeline</h3></div>
            <div className="card__body">
              <EventTimeline events={events} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
