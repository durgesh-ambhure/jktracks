import SkeletonPage from '../common/SkeletonPage';

export default function VendorRateEntryPage() {
  return <SkeletonPage title="Vendor Rate Entry" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Vendor Rate Entry' }]} note="Vendor rate-card entry — Tier-2 placeholder pending the rate-card data model." />;
}
