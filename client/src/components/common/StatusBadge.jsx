import { STATUS_BADGE_MAP } from '../../utils/constants';

export default function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-gray">-</span>;
  const color = STATUS_BADGE_MAP[status] || 'gray';
  return <span className={`badge badge-${color}`}>{status}</span>;
}
