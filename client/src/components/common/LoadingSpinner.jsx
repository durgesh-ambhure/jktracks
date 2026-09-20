export default function LoadingSpinner({ label = 'Loading…', size = 'md', full = false }) {
  return (
    <div className="state-block" style={full ? { minHeight: '40vh' } : undefined}>
      <div className={size === 'sm' ? 'spinner spinner-sm' : 'spinner'} role="status" aria-label={label} />
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
}
