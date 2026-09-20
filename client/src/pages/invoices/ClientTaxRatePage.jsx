import SkeletonPage from '../common/SkeletonPage';

export default function ClientTaxRatePage() {
  return <SkeletonPage title="Client Tax Rate" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Client Tax Rate' }]} note="Per-client tax rate configuration — Tier-2 placeholder." />;
}
