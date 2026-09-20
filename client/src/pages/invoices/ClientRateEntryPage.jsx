import SkeletonPage from '../common/SkeletonPage';

export default function ClientRateEntryPage() {
  return <SkeletonPage title="Client Rate Entry" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Client Rate Entry' }]} note="Rate-per-zone/weight-break entry — Tier-2 placeholder pending the rate-card data model." />;
}
