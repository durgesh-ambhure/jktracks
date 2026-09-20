import SkeletonPage from '../common/SkeletonPage';

export default function ApiLogPage() {
  return (
    <SkeletonPage
      title="API Request/Response Log"
      breadcrumb={[{ label: 'Tracking', to: '/tracking' }, { label: 'API Request/Response' }]}
      note="Vendor API request/response audit logging is not yet defined in CONTRACT.md as a dedicated endpoint. This screen is a placeholder — wiring will follow once the backend adds a per-courier API audit trail."
    />
  );
}
