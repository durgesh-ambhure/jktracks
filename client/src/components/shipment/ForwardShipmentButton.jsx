import { useState } from 'react';
import { Send } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import shipmentService from '../../services/shipment.service';

/**
 * Forward-to-courier action for the shipment detail page. The shipment already carries its
 * selected vendor (forwarding.vendorId, chosen at booking time), so this deliberately does NOT
 * show a second courier-picker — it just confirms against the vendor already on the shipment.
 */
export default function ForwardShipmentButton({ shipment, onForwarded }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const vendor = shipment.forwarding?.vendorId;
  const cf = shipment.courierForwarding;
  const alreadyForwarded = cf?.status === 'FORWARDED';
  const canForward = Boolean(vendor) && !alreadyForwarded;

  const handleConfirm = async () => {
    setForwarding(true);
    setError('');
    setResult(null);
    try {
      const res = await shipmentService.forward(shipment._id);
      setConfirmOpen(false);
      if (res.data?.success) {
        setResult(res.data);
      } else {
        setError(res.data?.lastError || res.message || 'Vendor rejected the shipment.');
      }
      onForwarded?.();
    } catch (err) {
      setConfirmOpen(false);
      setError(err.message || 'Unable to forward shipment.');
    } finally {
      setForwarding(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!canForward}
        title={!vendor ? 'Select a vendor in Forwarding Details first' : alreadyForwarded ? 'Already forwarded' : undefined}
        onClick={() => setConfirmOpen(true)}
      >
        <Send size={15} /> {alreadyForwarded ? 'Forwarded' : cf?.status === 'FORWARDING_FAILED' ? 'Retry Forward' : 'Forward Shipment'}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Forward Shipment"
        loading={forwarding}
        message={<p>Forward shipment <strong>{shipment.awbNo}</strong> to <strong>{vendor?.name}</strong> ({vendor?.vendorCode})?</p>}
        confirmLabel="Forward Shipment"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {error && (
        <div className="alert alert-danger" style={{ marginTop: 'var(--space-3)' }}>
          Unable to forward shipment<br />
          <span className="text-sm">Reason: {error}</span>
        </div>
      )}

      {result && (
        <div className="alert alert-success" style={{ marginTop: 'var(--space-3)' }}>
          <p className="fw-medium">Shipment forwarded successfully</p>
          <div className="grid-2 text-sm" style={{ marginTop: 'var(--space-2)' }}>
            <div><span className="text-muted">Courier: </span>{result.courier}</div>
            <div><span className="text-muted">Status: </span><StatusBadge status={result.status} /></div>
            <div><span className="text-muted">AWB: </span>{result.awbNumber || '-'}</div>
            <div><span className="text-muted">Tracking: </span>{result.trackingNumber || '-'}</div>
            <div><span className="text-muted">Vendor Shipment ID: </span>{result.vendorShipmentId || '-'}</div>
          </div>
          {result.labelUrl && (
            <a href={result.labelUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-3)' }}>
              View Label
            </a>
          )}
        </div>
      )}
    </>
  );
}
