import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCard({ label, value, icon: Icon, delta, deltaDirection = 'up' }) {
  return (
    <div className="stats-card">
      <div>
        <div className="stats-card__label">{label}</div>
        <div className="stats-card__value">{value}</div>
        {delta && (
          <div className={`stats-card__delta ${deltaDirection}`}>
            {deltaDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {delta}
          </div>
        )}
      </div>
      {Icon && (
        <div className="stats-card__icon">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
