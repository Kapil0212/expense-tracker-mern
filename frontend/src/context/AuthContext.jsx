import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('expenseTrackerToken');
    if (!token) { setCheckingAuth(false); return; }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.removeItem('expenseTrackerToken'); setUser(null); })
      .finally(() => setCheckingAuth(false));
  }, []);

  const saveSession = useCallback((data) => {
    localStorage.setItem('expenseTrackerToken', data.token);
    setUser(data.user);
  }, []);
  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    saveSession(data);
    return data;
  }, [saveSession]);
  const login = useCallback(async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    saveSession(data);
    return data;
  }, [saveSession]);
  const logout = useCallback(() => {
    localStorage.removeItem('expenseTrackerToken');
    setUser(null);
  }, []);
  const value = useMemo(() => ({ user, checkingAuth, signup, login, logout }), [user, checkingAuth, signup, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
