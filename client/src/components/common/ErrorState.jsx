import { AlertTriangle, RotateCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-block">
      <div className="state-block__icon" style={{ background: 'var(--color-danger-50)', color: 'var(--color-danger-500)' }}>
        <AlertTriangle size={26} />
      </div>
      <div className="state-block__title">Unable to load data</div>
      <p className="text-sm text-muted" style={{ maxWidth: 360 }}>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RotateCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
