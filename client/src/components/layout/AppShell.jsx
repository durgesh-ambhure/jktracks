import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { selectSidebarCollapsed } from '../../store/uiSlice';

export default function AppShell() {
  const collapsed = useSelector(selectSidebarCollapsed);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
