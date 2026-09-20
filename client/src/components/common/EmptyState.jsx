import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,
}) {
  return (
    <div className="state-block">
      <div className="state-block__icon">
        <Icon size={26} />
      </div>
      <div className="state-block__title">{title}</div>
      {description && <p className="text-sm text-muted" style={{ maxWidth: 360 }}>{description}</p>}
      {action}
    </div>
  );
}
