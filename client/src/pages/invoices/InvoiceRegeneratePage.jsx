import SkeletonPage from '../common/SkeletonPage';

export default function InvoiceRegeneratePage() {
  return <SkeletonPage title="Re-Generate Client Bill" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Re-Generate Client Bill' }]} note="Bill regeneration (void + reissue) workflow — Tier-2 placeholder." />;
}
