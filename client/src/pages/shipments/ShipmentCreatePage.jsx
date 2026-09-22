import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ShipmentForm from '../../components/shipment/ShipmentForm';
import shipmentService from '../../services/shipment.service';

export default function ShipmentCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await shipmentService.create(values);
      navigate(`/shipments/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Could not create shipment.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Shipment"
        subtitle="International Booking — consignor, consignee, packet, weight, forwarding & charges"
        breadcrumb={[{ label: 'Shipments', to: '/shipments' }, { label: 'New Shipment' }]}
      />
      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      <div className="card">
        <div className="card__body">
          <ShipmentForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create AWB" onCancel={() => navigate('/shipments')} />
        </div>
      </div>
    </div>
  );
}
