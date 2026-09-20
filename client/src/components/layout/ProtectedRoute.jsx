import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { usePermission } from '../../hooks/usePermission';
import NotAuthorizedPage from '../../pages/common/NotAuthorizedPage';

/**
 * Wraps authenticated routes. Redirects to /login when unauthenticated, and — when a
 * `permission` key is given and the user lacks it — renders a "Not authorized" page
 * instead of the target route (never a silent 404).
 */
export default function ProtectedRoute({ children, permission }) {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const allowed = usePermission(permission);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !allowed) {
    return <NotAuthorizedPage />;
  }

  return children;
}
