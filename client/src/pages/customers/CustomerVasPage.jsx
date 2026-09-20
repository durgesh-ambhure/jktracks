import SkeletonPage from '../common/SkeletonPage';

export default function CustomerVasPage() {
  return (
    <SkeletonPage
      title="Client VAS Detail"
      breadcrumb={[{ label: 'Clients', to: '/customers' }, { label: 'VAS Detail' }]}
      note="Value-added-service assignment per client is a Tier-2 placeholder — CRUD against /api/v1/masters/vas will be wired once the backend model is finalized."
    />
  );
}
