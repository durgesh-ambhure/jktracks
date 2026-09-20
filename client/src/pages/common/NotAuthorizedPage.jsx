import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotAuthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="not-authorized">
      <div className="state-block__icon" style={{ background: 'var(--color-danger-50)', color: 'var(--color-danger-500)', width: 64, height: 64 }}>
        <ShieldAlert size={30} />
      </div>
      <h2>Not authorized</h2>
      <p className="text-muted" style={{ maxWidth: 420 }}>
        Your account role does not have permission to view this page. Contact an administrator
        if you believe this is a mistake.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
}
