import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import navigation from '../../routes/navigation';
import { usePermissionChecker } from '../../hooks/usePermission';

function isGroupActive(item, pathname) {
  if (item.path) return pathname === item.path || pathname.startsWith(`${item.path}/`);
  if (item.children) return item.children.some((c) => isGroupActive(c, pathname));
  return false;
}

/**
 * Horizontal, desktop-only navigation rendered straight from the shared `navigation` config
 * (the same source Sidebar.jsx uses for the mobile drawer) — every existing route stays
 * reachable, only its location in the UI changes.
 */
export default function TopNavigation() {
  const hasPermission = usePermissionChecker();
  const { pathname } = useLocation();
  const [openKey, setOpenKey] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    setOpenKey(null);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenKey(null);
    }
    function onEscape(e) {
      if (e.key === 'Escape') setOpenKey(null);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <nav className="top-nav" ref={rootRef}>
      {navigation
        .filter((item) => item.title !== 'Dashboard')
        .map((item) => {
          const visibleChildren = (item.children || []).filter(
            (child) => !child.permission || hasPermission(child.permission)
          );
          if (item.children && visibleChildren.length === 0) return null;
          if (!item.children && item.permission && !hasPermission(item.permission)) return null;

          if (!item.children) {
            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) => `top-nav__item ${isActive ? 'active' : ''}`}
              >
                <span>{item.title}</span>
              </NavLink>
            );
          }

          const open = openKey === item.title;
          const active = isGroupActive(item, pathname);

          return (
            <div key={item.title} className={`top-nav__group ${open ? 'open' : ''}`}>
              <button
                type="button"
                className={`top-nav__item top-nav__trigger ${active ? 'active' : ''}`}
                onClick={() => setOpenKey(open ? null : item.title)}
                aria-expanded={open}
              >
                <span>{item.title}</span>
                <ChevronDown size={13} className="top-nav__chevron" />
              </button>
              {open && (
                <div className="top-nav__dropdown" role="menu">
                  {visibleChildren.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) => `top-nav__dropdown-item ${isActive ? 'active' : ''}`}
                      role="menuitem"
                    >
                      <span>{child.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </nav>
  );
}
