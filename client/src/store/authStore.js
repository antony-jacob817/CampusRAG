import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize store from localStorage
  initAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const storedToken = localStorage.getItem('campusrag_token');
      const storedUser = localStorage.getItem('campusrag_user');

      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
        });

        // Verify token with server
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            set({ user: res.data.user });
            localStorage.setItem('campusrag_user', JSON.stringify(res.data.user));
          }
        } catch (verifyErr) {
          // If token expired, clear auth
          if (verifyErr.response?.status === 401) {
            get().logout();
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth from localStorage:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('campusrag_token', token);
      localStorage.setItem('campusrag_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed.';
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  register: async ({ name, email, password, role = 'student', department = 'general' }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        department,
      });
      const { user, token } = response.data;

      localStorage.setItem('campusrag_token', token);
      localStorage.setItem('campusrag_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Registration failed.';
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusrag_token');
      localStorage.removeItem('campusrag_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
  },

  clearError: () => set({ error: null }),
}));
