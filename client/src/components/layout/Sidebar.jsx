import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import navigation from '../../routes/navigation';
import {
  selectSidebarMobileOpen,
  selectExpandedGroups,
  toggleGroupExpanded,
  setSidebarMobileOpen,
} from '../../store/uiSlice';
import { usePermissionChecker } from '../../hooks/usePermission';

function isGroupActive(item, pathname) {
  if (item.path) return pathname === item.path || pathname.startsWith(`${item.path}/`);
  if (item.children) return item.children.some((c) => isGroupActive(c, pathname));
  return false;
}

function NavGroup({ item, pathname, hasPermission, closeMobile }) {
  const dispatch = useDispatch();
  const expandedGroups = useSelector(selectExpandedGroups);
  const visibleChildren = (item.children || []).filter(
    (child) => !child.permission || hasPermission(child.permission)
  );

  if (item.children && visibleChildren.length === 0) return null;
  if (!item.children && item.permission && !hasPermission(item.permission)) return null;

  if (!item.children) {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => `nav-group__label ${isActive ? 'active' : ''}`}
        onClick={closeMobile}
      >
        <span className="nav-group__icon">
          <Icon size={18} />
        </span>
        <span className="nav-group__title">{item.title}</span>
      </NavLink>
    );
  }

  const Icon = item.icon;
  const open = Boolean(expandedGroups[item.title]);
  const active = isGroupActive(item, pathname);

  return (
    <div className="nav-group">
      <button
        type="button"
        className={`nav-group__label ${active && !open ? 'active' : ''}`}
        onClick={() => dispatch(toggleGroupExpanded(item.title))}
      >
        <span className="nav-group__icon">
          <Icon size={18} />
        </span>
        <span className="nav-group__title">{item.title}</span>
        <span className={`nav-group__chevron ${open ? 'open' : ''}`}>
          <ChevronRight size={14} />
        </span>
      </button>
      {open && (
        <ul className="nav-children">
          {visibleChildren.map((child) => (
            <li key={child.path}>
              <NavLink
                to={child.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <span className="nav-link__dot" />
                {child.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Mobile-only navigation drawer. On tablet/desktop the same `navigation` config renders as
 * the horizontal TopNav inside Header; below the breakpoint it collapses into this off-canvas
 * drawer so every route stays reachable without a permanent sidebar.
 */
export default function Sidebar() {
  const dispatch = useDispatch();
  const mobileOpen = useSelector(selectSidebarMobileOpen);
  const hasPermission = usePermissionChecker();
  const { pathname } = useLocation();

  const closeMobile = () => dispatch(setSidebarMobileOpen(false));

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar__brand">
          <div className="app-header__brand-mark">JK</div>
          <span className="sidebar__brand-text">JK Tracks</span>
          <button type="button" className="sidebar__close" onClick={closeMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar__nav">
          {navigation.map((item) => (
            <NavGroup
              key={item.title}
              item={item}
              pathname={pathname}
              hasPermission={hasPermission}
              closeMobile={closeMobile}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
