import SkeletonPage from '../common/SkeletonPage';

export default function CourierServiceConfigPage() {
  return (
    <SkeletonPage
      title="Vendor Service Configuration"
      breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: 'Service Configuration' }]}
      note="Fuel surcharge and per-service rate configuration engine — Tier-2 placeholder pending the rate-card data model."
    />
  );
}
