import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/common/LoadingSpinner';
import { setAccessToken, loginSuccess, logout } from './store/authSlice';
import authService from './services/auth.service';

export default function App() {
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const refreshRes = await authService.refresh();
        const accessToken = refreshRes.data?.accessToken;
        if (accessToken) {
          dispatch(setAccessToken(accessToken));
          const meRes = await authService.me();
          dispatch(loginSuccess({ user: meRes.data.user, accessToken }));
        }
      } catch {
        dispatch(logout());
      } finally {
        setBootstrapped(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bootstrapped) {
    return <LoadingSpinner label="Loading JK Tracks…" full />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
