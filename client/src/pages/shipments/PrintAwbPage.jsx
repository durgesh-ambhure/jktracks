import { useState } from 'react';
import { Search, Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import shipmentService from '../../services/shipment.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PrintAwbPage() {
  const [awb, setAwb] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipment, setShipment] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const res = await shipmentService.list({ search: awb.trim(), limit: 1 });
      if (res.data?.length) setShipment(res.data[0]);
      else setError('No shipment found for that AWB number.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Print AWB Document" subtitle="Look up a shipment by AWB number to generate a printable label" />

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__body">
          <form onSubmit={handleSearch} className="flex gap-2" style={{ maxWidth: 480 }}>
            <SearchInput value={awb} onChange={setAwb} placeholder="Enter AWB number…" />
            <button type="submit" className="btn btn-primary"><Search size={15} /> Find</button>
          </form>
        </div>
      </div>

      {loading && <LoadingSpinner label="Searching…" />}
      {!loading && error && <EmptyState title="Not found" description={error} />}

      {!loading && shipment && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">AWB Label Preview</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
          </div>
          <div className="card__body" id="awb-print-area">
            <div className="grid-2" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <p className="text-xs text-muted">AWB No</p>
                <h2 style={{ margin: 0 }}>{shipment.awbNo}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-xs text-muted">Booking Date</p>
                <p className="fw-semibold">{formatDate(shipment.bookingDate)}</p>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card">
                <div className="card__body">
                  <p className="text-xs text-muted">FROM</p>
                  <p className="fw-semibold">{shipment.consignor?.name}</p>
                  <p className="text-sm">{[shipment.consignor?.address1, shipment.consignor?.city, shipment.consignor?.pincode].filter(Boolean).join(', ')}</p>
                  <p className="text-sm">{shipment.consignor?.phone}</p>
                </div>
              </div>
              <div className="card">
                <div className="card__body">
                  <p className="text-xs text-muted">TO</p>
                  <p className="fw-semibold">{shipment.consignee?.name}</p>
                  <p className="text-sm">{[shipment.consignee?.address1, shipment.consignee?.city, shipment.consignee?.pincode].filter(Boolean).join(', ')}</p>
                  <p className="text-sm">{shipment.consignee?.phone}</p>
                </div>
              </div>
            </div>
            <div className="grid-4 text-sm">
              <div><span className="text-muted">Packet Type: </span>{shipment.packetType}</div>
              <div><span className="text-muted">Payment: </span>{shipment.paymentType}</div>
              <div><span className="text-muted">Pieces: </span>{shipment.weightDetails?.pieces}</div>
              <div><span className="text-muted">Amount: </span>{formatCurrency(shipment.amount, shipment.currency)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
