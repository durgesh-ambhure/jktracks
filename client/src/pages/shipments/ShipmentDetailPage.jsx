import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Ban, Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AddressCard from '../../components/shipment/AddressCard';
import ForwardShipmentButton from '../../components/shipment/ForwardShipmentButton';
import EventTimeline from '../../components/tracking/EventTimeline';
import shipmentService from '../../services/shipment.service';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpdate = usePermission('shipments.update');
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [events, setEvents] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setState({ loading: true, error: '', data: null });
    try {
      const res = await shipmentService.get(id);
      setState({ loading: false, error: '', data: res.data });
      try {
        const ev = await shipmentService.listEvents(id);
        setEvents(ev.data || []);
      } catch {
        setEvents([]);
      }
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <LoadingSpinner label="Loading shipment…" full />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const s = state.data;

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await shipmentService.cancel(id, cancelReason);
      setCancelOpen(false);
      load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={s.awbNo}
        breadcrumb={[{ label: 'Shipments', to: '/shipments' }, { label: s.awbNo }]}
        subtitle={<StatusBadge status={s.status} />}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/shipments/print')}>
              <Printer size={15} /> Print AWB
            </button>
            {canUpdate && s.status !== 'CANCELLED' && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/shipments/${id}/edit`)}>
                  <Pencil size={15} /> Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setCancelOpen(true)}>
                  <Ban size={15} /> Cancel
                </button>
              </>
            )}
          </>
        }
      />

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body grid-4">
          <div><p className="text-xs text-muted">Booking Date</p><p className="fw-medium">{formatDate(s.bookingDate)}</p></div>
          <div><p className="text-xs text-muted">Client</p><p className="fw-medium">{s.clientId?.name || '-'}</p></div>
          <div><p className="text-xs text-muted">Vendor</p><p className="fw-medium">{s.forwarding?.vendorId?.name || '-'}</p></div>
          <div><p className="text-xs text-muted">Business Type</p><p className="fw-medium">{s.businessType}</p></div>
          <div><p className="text-xs text-muted">Packet Type</p><p className="fw-medium">{s.packetType}</p></div>
          <div><p className="text-xs text-muted">Payment Type</p><p className="fw-medium">{s.paymentType}</p></div>
          <div><p className="text-xs text-muted">Amount</p><p className="fw-medium">{formatCurrency(s.amount, s.currency)}</p></div>
          <div><p className="text-xs text-muted">Invoice No</p><p className="fw-medium">{s.invoiceNo || '-'}</p></div>
        </div>
      </div>

      {s.status !== 'CANCELLED' && (
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="card__header">
            <h3 className="card__title">Courier Forwarding</h3>
            <StatusBadge status={s.courierForwarding?.status || 'NOT_FORWARDED'} />
          </div>
          <div className="card__body">
            {canUpdate ? (
              <ForwardShipmentButton shipment={s} onForwarded={load} />
            ) : (
              <p className="text-sm text-muted">You don&apos;t have permission to forward this shipment.</p>
            )}
            {s.courierForwarding?.status === 'FORWARDED' && (
              <div className="grid-4 text-sm" style={{ marginTop: 'var(--space-3)' }}>
                <div><span className="text-muted">Courier: </span>{s.courierForwarding.vendorName || s.courierForwarding.vendorCode}</div>
                <div><span className="text-muted">Vendor AWB: </span>{s.courierForwarding.vendorAwbNumber || '-'}</div>
                <div><span className="text-muted">Tracking No: </span>{s.courierForwarding.trackingNumber || '-'}</div>
                <div><span className="text-muted">Forwarded At: </span>{formatDate(s.courierForwarding.forwardedAt)}</div>
              </div>
            )}
            {s.courierForwarding?.status === 'FORWARDING_FAILED' && s.courierForwarding?.lastError && (
              <p className="text-sm" style={{ marginTop: 'var(--space-3)' }}><span className="text-muted">Last error: </span>{s.courierForwarding.lastError}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <AddressCard title="Consignor" address={s.consignor} />
        <AddressCard title="Consignee" address={s.consignee} />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Weight Details</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Pieces: </span>{s.weightDetails?.pieces}</div>
              <div><span className="text-muted">Actual Weight: </span>{s.weightDetails?.actualWeight} {s.weightDetails?.weightUnit}</div>
              <div><span className="text-muted">Vendor Weight: </span>{s.weightDetails?.vendorWeight || '-'}</div>
              <div><span className="text-muted">Divisor: </span>{s.weightDetails?.divisor || '-'}</div>
              <div><span className="text-muted">Volumetric: </span>{s.weightDetails?.isVolumetric ? 'Yes' : 'No'}</div>
              <div><span className="text-muted">Boxes: </span>{s.weightDetails?.boxes?.length || 0}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Forwarding Details</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Service Type: </span>{s.forwarding?.serviceType || '-'}</div>
              <div><span className="text-muted">Packaging: </span>{s.forwarding?.packaging || '-'}</div>
              <div><span className="text-muted">Forwarding No 1: </span>{s.forwarding?.forwardingNo1 || '-'}</div>
              <div><span className="text-muted">Forwarding No 2: </span>{s.forwarding?.forwardingNo2 || '-'}</div>
              <div><span className="text-muted">Incoterms: </span>{s.forwarding?.incoterms || '-'}</div>
              <div><span className="text-muted">Pickup Point: </span>{s.forwarding?.pickupPoint || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Client Charges</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Freight: </span>{formatCurrency(s.clientCharges?.freight, s.currency)}</div>
              <div><span className="text-muted">Other: </span>{formatCurrency(s.clientCharges?.otherCharges, s.currency)}</div>
              <div><span className="text-muted">Fuel: </span>{formatCurrency(s.clientCharges?.fuel, s.currency)}</div>
              <div><span className="text-muted">GST: </span>{formatCurrency(s.clientCharges?.gst, s.currency)}</div>
            </div>
            <p className="text-sm" style={{ marginTop: 8 }}><strong>Total: {formatCurrency(s.clientCharges?.total, s.currency)}</strong></p>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><h3 className="card__title">Vendor Charges</h3></div>
          <div className="card__body text-sm">
            <div className="grid-2">
              <div><span className="text-muted">Freight: </span>{formatCurrency(s.vendorCharges?.freight, s.currency)}</div>
              <div><span className="text-muted">Other: </span>{formatCurrency(s.vendorCharges?.otherCharges, s.currency)}</div>
              <div><span className="text-muted">Fuel: </span>{formatCurrency(s.vendorCharges?.fuel, s.currency)}</div>
              <div><span className="text-muted">GST: </span>{formatCurrency(s.vendorCharges?.gst, s.currency)}</div>
            </div>
            <p className="text-sm" style={{ marginTop: 8 }}><strong>Total: {formatCurrency(s.vendorCharges?.total, s.currency)}</strong></p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header"><h3 className="card__title">Tracking Timeline</h3></div>
        <div className="card__body">
          <EventTimeline events={events} />
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Shipment"
        danger
        loading={cancelling}
        message={
          <div>
            <p>Cancel shipment <strong>{s.awbNo}</strong>? This cannot be undone.</p>
            <textarea className="form-control" rows={2} placeholder="Reason for cancellation" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
        }
        confirmLabel="Cancel Shipment"
        onConfirm={confirmCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
