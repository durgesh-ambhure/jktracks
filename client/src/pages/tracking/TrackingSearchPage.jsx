import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';

export default function TrackingSearchPage() {
  const navigate = useNavigate();
  const [awb, setAwb] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (awb.trim()) navigate(`/tracking/${encodeURIComponent(awb.trim())}`);
  };

  return (
    <div>
      <PageHeader title="Track Shipment" subtitle="Look up a shipment by AWB, reference or forwarding number" />
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit} className="flex gap-2" style={{ maxWidth: 480 }}>
            <SearchInput value={awb} onChange={setAwb} placeholder="Enter AWB / Ref / Forwarding No…" />
            <button type="submit" className="btn btn-primary"><Search size={15} /> Track</button>
          </form>
        </div>
      </div>
    </div>
  );
}
