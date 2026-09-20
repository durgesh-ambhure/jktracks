import SkeletonPage from '../common/SkeletonPage';

export default function GenerateIrnPage() {
  return <SkeletonPage title="Generate IRN" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'Generate IRN' }]} note="GST e-invoice IRN generation integrates with an external government API — stubbed pending credentials." />;
}
