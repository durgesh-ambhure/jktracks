import SkeletonPage from '../common/SkeletonPage';

export default function CourierAccountsPage() {
  return (
    <SkeletonPage
      title="Vendor Account Detail"
      breadcrumb={[{ label: 'Vendors', to: '/couriers' }, { label: 'Account Detail' }]}
      note="Vendor Account Detail + Vendor Accounts Master — Tier-2 placeholder. Backs onto /api/v1/masters/vendor-accounts generic CRUD once the field-level schema is finalized."
    />
  );
}
