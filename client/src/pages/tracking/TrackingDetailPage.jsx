import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import AddressCard from '../../components/shipment/AddressCard';
import EventTimeline from '../../components/tracking/EventTimeline';
import trackingService from '../../services/tracking.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TrackingDetailPage() {
  const { awb } = useParams();
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await trackingService.trackByAwb(awb);
      setState({ loading: false, error: '', data: res.data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [awb]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Fetching tracking details…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const shipment = state.data?.shipment || state.data;
  const events = state.data?.events || [];

  return (
    <div>
      <PageHeader
        title={`Tracking — ${awb}`}
        breadcrumb={[{ label: 'Tracking', to: '/tracking' }, { label: awb }]}
        subtitle={shipment?.status && <StatusBadge status={shipment.status} />}
      />

      {shipment && (
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="card__body grid-4">
            <div><p className="text-xs text-muted">Booking Date</p><p className="fw-medium">{formatDate(shipment.bookingDate)}</p></div>
            <div><p className="text-xs text-muted">Packet Type</p><p className="fw-medium">{shipment.packetType}</p></div>
            <div><p className="text-xs text-muted">Pieces</p><p className="fw-medium">{shipment.weightDetails?.pieces || '-'}</p></div>
            <div><p className="text-xs text-muted">Amount</p><p className="fw-medium">{formatCurrency(shipment.amount, shipment.currency)}</p></div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        {shipment?.consignor && <AddressCard title="Consignor" address={shipment.consignor} />}
        {shipment?.consignee && <AddressCard title="Consignee" address={shipment.consignee} />}
      </div>

      <div className="card">
        <div className="card__header"><h3 className="card__title">Tracking History</h3></div>
        <div className="card__body">
          <EventTimeline events={events} />
        </div>
      </div>
    </div>
  );
}
