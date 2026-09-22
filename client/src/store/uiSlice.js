import { createSlice } from '@reduxjs/toolkit';

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const initialState = {
  // Mobile-only nav drawer (top-nav collapses into this below the tablet breakpoint).
  sidebarMobileOpen: false,
  expandedGroups: readLocal('jkt_sidebar_expanded', {}),
  pageSize: readLocal('jkt_page_size', 20),
  theme: readLocal('jkt_theme', 'light'),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarMobileOpen(state, action) {
      state.sidebarMobileOpen = action.payload;
    },
    toggleGroupExpanded(state, action) {
      const key = action.payload;
      state.expandedGroups[key] = !state.expandedGroups[key];
      writeLocal('jkt_sidebar_expanded', state.expandedGroups);
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
      writeLocal('jkt_page_size', action.payload);
    },
    setTheme(state, action) {
      state.theme = action.payload;
      writeLocal('jkt_theme', action.payload);
    },
  },
});

export const {
  setSidebarMobileOpen,
  toggleGroupExpanded,
  setPageSize,
  setTheme,
} = uiSlice.actions;

export const selectSidebarMobileOpen = (state) => state.ui.sidebarMobileOpen;
export const selectExpandedGroups = (state) => state.ui.expandedGroups;
export const selectPageSize = (state) => state.ui.pageSize;

export default uiSlice.reducer;
