import SkeletonPage from '../common/SkeletonPage';

export default function VendorFuelSurchargePage() {
  return <SkeletonPage title="Vendor Fuel Surcharge" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Vendor Fuel Surcharge' }]} note="Fuel surcharge percentage configuration per vendor — Tier-2 placeholder." />;
}
