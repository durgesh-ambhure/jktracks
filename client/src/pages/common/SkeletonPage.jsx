import { Construction } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

/**
 * Shared shell for Tier-2 pages that don't yet have deep business logic wired up.
 * Keeps every documented route in ROUTES.md rendering a real, consistently styled
 * component rather than a 404, per CONTRACT.md guidance for Tier 2 skeleton pages.
 */
export default function SkeletonPage({ title, note, breadcrumb, children }) {
  return (
    <div>
      <PageHeader
        title={title}
        breadcrumb={breadcrumb}
        actions={<span className="inline-note"><Construction size={13} /> Coming soon</span>}
      />
      <div className="card">
        <div className="card__body">
          {note && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
              {note}
            </div>
          )}
          {children || (
            <EmptyState
              title="This module is a documented placeholder"
              description="Route, layout and navigation entry are wired up. Full business logic will be implemented once the backend model for this screen is finalized."
            />
          )}
        </div>
      </div>
    </div>
  );
}
