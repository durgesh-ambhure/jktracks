import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ShipmentForm from '../../components/shipment/ShipmentForm';
import shipmentService from '../../services/shipment.service';
import { toInputDate } from '../../utils/formatters';

function toFormValues(shipment) {
  return {
    ...shipment,
    clientId: shipment.clientId?._id || shipment.clientId || '',
    bookingDate: toInputDate(shipment.bookingDate),
    forwarding: { ...shipment.forwarding, vendorId: shipment.forwarding?.vendorId?._id || shipment.forwarding?.vendorId || '' },
  };
}

export default function ShipmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await shipmentService.get(id);
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
      await shipmentService.update(id, values);
      navigate(`/shipments/${id}`);
    } catch (err) {
      setSubmitError(err.message || 'Could not update shipment.');
      setSubmitting(false);
    }
  };

  if (state.loading) return <LoadingSpinner label="Loading shipment…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title={`Edit Shipment — ${state.data.awbNo}`}
        breadcrumb={[{ label: 'Shipments', to: '/shipments' }, { label: state.data.awbNo, to: `/shipments/${id}` }, { label: 'Edit' }]}
      />
      {submitError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{submitError}</div>}
      <div className="card">
        <div className="card__body">
          <ShipmentForm
            defaultValues={toFormValues(state.data)}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save Changes"
            onCancel={() => navigate(`/shipments/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
