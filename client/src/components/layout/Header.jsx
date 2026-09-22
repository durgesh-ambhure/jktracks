import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, KeyRound, UserCircle } from 'lucide-react';
import { selectCurrentUser, logout } from '../../store/authSlice';
import { setSidebarMobileOpen } from '../../store/uiSlice';
import { initials } from '../../utils/formatters';
import authService from '../../services/auth.service';
import TopNavigation from './TopNavigation';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app-header-group">
      <header className="app-header">
        <button
          type="button"
          className="icon-btn header-menu-btn"
          onClick={() => dispatch(setSidebarMobileOpen(true))}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="app-header__brand app-header__brand--link"
          onClick={() => navigate('/dashboard')}
          aria-label="Go to dashboard"
        >
          <div className="app-header__brand-mark">JK</div>
        </button>

        <TopNavigation />

        <div className="app-header__actions">
          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={19} />
            <span className="icon-btn__dot" />
          </button>

          <div className="user-menu">
            <button type="button" className="user-menu__trigger" onClick={() => setMenuOpen((v) => !v)}>
              <div className="user-menu__avatar">{initials(user?.name) || 'U'}</div>
              <div className="user-menu__name">
                <strong>{user?.name || 'User'}</strong>
                <span className="text-xs text-muted">{user?.role || ''}</span>
              </div>
            </button>
            {menuOpen && (
              <div className="user-menu__dropdown" onMouseLeave={() => setMenuOpen(false)}>
                <a href="/settings/profile" onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/settings/profile'); }}>
                  <UserCircle size={15} /> Your Profile
                </a>
                <a href="/change-password" onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/change-password'); }}>
                  <KeyRound size={15} /> Change Password
                </a>
                <button type="button" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
