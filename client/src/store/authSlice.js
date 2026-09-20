import { createSlice } from '@reduxjs/toolkit';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('jkt_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  accessToken: null, // never persisted; refreshed via /auth/refresh on load
  status: 'idle', // idle | loading | authenticated | error
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess(state, action) {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
      try {
        localStorage.setItem('jkt_user', JSON.stringify(action.payload.user));
      } catch {
        /* ignore */
      }
    },
    loginFailure(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.status = action.payload ? 'authenticated' : state.status;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem('jkt_user', JSON.stringify(state.user));
      } catch {
        /* ignore */
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
      try {
        localStorage.removeItem('jkt_user');
      } catch {
        /* ignore */
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, setAccessToken, updateUser, logout } =
  authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthStatus = (state) => state.auth.status;
export const selectPermissions = (state) => state.auth.user?.permissions || [];

export default authSlice.reducer;
