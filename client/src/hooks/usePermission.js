import { useSelector } from 'react-redux';
import { selectCurrentUser, selectPermissions } from '../store/authSlice';

/**
 * Returns a checker function for a single permission key ("shipments.read") when called
 * with an argument, or use the hook's own boolean result directly.
 * SUPER_ADMIN implicitly has every permission (mirrors backend short-circuit).
 */
export function usePermission(permissionKey) {
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);

  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!permissionKey) return true;
  return permissions.includes(permissionKey);
}

export function usePermissionChecker() {
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);

  return (permissionKey) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (!permissionKey) return true;
    return permissions.includes(permissionKey);
  };
}

export default usePermission;
