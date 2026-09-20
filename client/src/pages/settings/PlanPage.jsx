import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { settingsService } from '../../services/generic.service';

const service = settingsService('plan');

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await service.list();
        setPlan((res.data || [])[0] || null);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading plan…" full />;

  return (
    <div>
      <PageHeader title="Your Plan" subtitle="Subscription plan and included features" />
      <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
        Read-only demo screen — billing/subscription management is out of scope for this build.
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card__body">
          <h3 style={{ marginBottom: 4 }}>{plan?.name || 'Standard Plan'}</h3>
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            {plan ? 'Loaded from settings service.' : 'No plan record configured on the backend yet — showing placeholder tiers.'}
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(plan?.features || ['Unlimited shipment bookings', 'Real-time tracking', 'Standard reports', 'Email support']).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 size={15} style={{ color: 'var(--color-success-500)' }} /> {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
