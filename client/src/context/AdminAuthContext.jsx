import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, logoutAdmin, checkAdminAuth, getAdminToken } from '../services/galleryApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminTokenState] = useState(() => getAdminToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const token = getAdminToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const res = await checkAdminAuth();
      if (res?.success) {
        setIsAuthenticated(true);
        setAdminTokenState(token);
      } else {
        setIsAuthenticated(false);
        setAdminTokenState(null);
      }
      setIsLoading(false);
    }
    verify();
  }, []);

  const login = async (password) => {
    const res = await loginAdmin(password);
    if (res?.success && res.token) {
      setIsAuthenticated(true);
      setAdminTokenState(res.token);
    }
    return res;
  };

  const logout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setAdminTokenState(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminToken, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
