import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * `variant` is optional — omit it for the existing neutral white card (used on report
 * pages). Pass one of the dashboard variants below for a filled, colored tile.
 */
export default function StatsCard({ label, value, icon: Icon, delta, deltaDirection = 'up', variant }) {
  const className = variant ? `stats-card stats-card--${variant}` : 'stats-card';
  return (
    <div className={className}>
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
