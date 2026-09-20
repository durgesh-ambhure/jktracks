export default function ChartCard({ title, subtitle, actions, children, height = 300 }) {
  return (
    <div className="card chart-card">
      <div className="card__header">
        <div>
          <h3 className="card__title">{title}</h3>
          {subtitle && <p className="text-xs text-muted" style={{ marginTop: 4 }}>{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="card__body" style={{ height }}>
        {children}
      </div>
    </div>
  );
}
