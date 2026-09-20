import api, { unwrap } from './api';

const authService = {
  login: (email, password) => unwrap(api.post('/auth/login', { email, password })),
  logout: () => unwrap(api.post('/auth/logout', {})),
  refresh: () => unwrap(api.post('/auth/refresh')),
  me: () => unwrap(api.get('/auth/me')),
  forgotPassword: (email) => unwrap(api.post('/auth/forgot-password', { email })),
  resetPassword: (token, newPassword) =>
    unwrap(api.post('/auth/reset-password', { token, newPassword })),
  changePassword: (currentPassword, newPassword) =>
    unwrap(api.post('/auth/change-password', { currentPassword, newPassword })),
};

export default authService;
