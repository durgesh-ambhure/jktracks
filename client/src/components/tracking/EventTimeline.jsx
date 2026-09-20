import { CheckCircle2, Circle, PackageSearch } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function EventTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No tracking events yet"
        description="Movement updates will appear here once the shipment is scanned by the carrier."
      />
    );
  }

  const sorted = [...events].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return (
    <div className="timeline">
      {sorted.map((event, idx) => (
        <div className="timeline-item" key={event._id || idx}>
          <div className={`timeline-item__dot ${idx === 0 ? 'done' : ''}`}>
            {idx === 0 ? <CheckCircle2 size={12} /> : <Circle size={10} />}
          </div>
          <div className="timeline-item__title">{event.status}</div>
          <div className="timeline-item__meta">
            {formatDateTime(event.date || event.createdAt)}
            {event.location ? ` · ${event.location}` : ''}
          </div>
          {(event.statusDetails || event.reasonCode) && (
            <div className="timeline-item__desc">
              {event.reasonCode ? `${event.reasonCode} — ` : ''}
              {event.statusDetails}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
