import SkeletonPage from '../common/SkeletonPage';

export default function IrnReportPage() {
  return <SkeletonPage title="IRN Report" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'IRN Report' }]} note="Report of generated e-invoice IRNs — Tier-2 placeholder, depends on Generate IRN integration." />;
}
