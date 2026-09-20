import SkeletonPage from '../common/SkeletonPage';

export default function CargoTaxInvoicePage() {
  return <SkeletonPage title="Cargo Tax Invoice" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Cargo Tax Invoice' }]} note="High-value cargo tax invoice generation — Tier-2 placeholder." />;
}
