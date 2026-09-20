import { useState } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import EmptyState from '../../components/common/EmptyState';

export default function ClientRateEnquiryPage() {
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <PageHeader title="Client Rate Enquiry" subtitle="Look up a client rate by route/weight without booking" />
      <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>Rate calculation engine — placeholder. Enquiry form is wired up; the lookup itself awaits the rate-card backend.</div>
      <div className="card">
        <div className="card__body">
          <div className="form-grid-3">
            <FormInput label="Origin Pincode" />
            <FormInput label="Destination Pincode" />
            <FormInput label="Weight (kg)" type="number" />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setChecked(true)}><Search size={15} /> Check Rate</button>
          {checked && (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <EmptyState title="No rate card configured yet" description="Once client rate cards are imported, matching rates will show here." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
