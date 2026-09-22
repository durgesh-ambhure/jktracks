import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      {/* Mobile-only nav drawer — hidden on desktop, where TopNavigation inside Header
          covers the same navigation config. */}
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
