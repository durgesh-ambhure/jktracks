import SkeletonPage from '../common/SkeletonPage';

export default function TopayInvoicePage() {
  return <SkeletonPage title="Cash / ToPay Invoice" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Cash/ToPay Invoice' }]} note="Cash/ToPay invoice generation — Tier-2 placeholder." />;
}
