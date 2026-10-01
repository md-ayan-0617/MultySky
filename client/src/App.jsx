import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Helper to handle legacy query-string navigation (?join=..., ?master=..., ?display=...)
function LegacyQueryHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const joinCode = urlParams.get('join');
    const masterCode = urlParams.get('master');
    const displaySession = urlParams.get('display');
    const deviceId = urlParams.get('deviceId');
    const deviceName = urlParams.get('deviceName');

    if (displaySession) {
      navigate(`/display/${displaySession}?deviceId=${deviceId || 'dev-' + Date.now()}&deviceName=${encodeURIComponent(deviceName || 'Phone Screen')}`, { replace: true });
    } else if (joinCode) {
      navigate(`/join/${joinCode}`, { replace: true });
    } else if (masterCode) {
      navigate(`/session/${masterCode}`, { replace: true });
    }
  }, [location.search, navigate]);

  return null;
}

export default function App() {
  // Theme state — default to dark or light based on preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ms-theme') || 'dark';
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('ms-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <div className="app-container">
          <LegacyQueryHandler />
          <AppRoutes theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
