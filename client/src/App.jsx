import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Context
import { AdminAuthProvider } from './context/AdminAuthContext';

// Public & Session Pages
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import MasterDashboard from './pages/MasterDashboard';
import DisplayScreen from './pages/DisplayScreen';
import NotFound from './pages/NotFound';

// Public Gallery Pages
import GalleryHome from './pages/gallery/GalleryHome';
import CategoryGallery from './pages/gallery/CategoryGallery';

// Admin CMS Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminImages from './pages/admin/AdminImages';
import AdminUpload from './pages/admin/AdminUpload';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';

// Layout Chrome
import Header from './components/Header';
import Footer from './components/Footer';

function AppContent({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Backward-compatible query string routing (?join=..., ?master=..., ?display=...)
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

  // Determine if public header/footer should show
  const isPublicPage = 
    location.pathname === '/' || 
    location.pathname === '/create-session' || 
    location.pathname.startsWith('/join') ||
    location.pathname.startsWith('/gallery');

  const getPageIdentifier = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/create-session') return 'create';
    if (location.pathname.startsWith('/join')) return 'join';
    if (location.pathname.startsWith('/gallery')) return 'gallery';
    return '';
  };

  const handleNav = (target, params = {}) => {
    if (target === 'home') navigate('/');
    else if (target === 'create') navigate('/create-session');
    else if (target === 'join') navigate('/join');
    else if (target === 'gallery') navigate('/gallery');
    else if (target === 'admin') navigate('/admin');
    else if (target === 'master') navigate(`/session/${params.sessionId || ''}`);
    else if (target === 'display') navigate(`/display/${params.sessionId}?deviceId=${params.deviceId || ''}&deviceName=${encodeURIComponent(params.deviceName || '')}&mode=display`);
  };

  return (
    <div className="app-container">
      {isPublicPage && (
        <Header
          currentPage={getPageIdentifier()}
          onNavigate={handleNav}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home onNavigate={handleNav} />
          }
        />

        <Route
          path="/create-session"
          element={
            <CreateSession
              onNavigate={handleNav}
              onCreated={(session) => navigate(`/session/${session.id}`)}
            />
          }
        />

        <Route
          path="/join"
          element={
            <JoinSession
              onNavigate={handleNav}
              onJoined={(session, device) =>
                navigate(`/display/${session.id}?deviceId=${device.id}&deviceName=${encodeURIComponent(device.name)}&mode=display`)
              }
            />
          }
        />

        <Route
          path="/join/:sessionId"
          element={
            <JoinSession
              onNavigate={handleNav}
              onJoined={(session, device) =>
                navigate(`/display/${session.id}?deviceId=${device.id}&deviceName=${encodeURIComponent(device.name)}&mode=display`)
              }
            />
          }
        />

        <Route
          path="/session/:sessionId"
          element={
            <MasterDashboard
              onNavigate={handleNav}
              theme={theme}
              onToggleTheme={onToggleTheme}
            />
          }
        />

        <Route
          path="/display"
          element={
            <Navigate to="/join" replace />
          }
        />

        <Route
          path="/display/:sessionId"
          element={
            <DisplayScreen onNavigate={handleNav} />
          }
        />

        <Route
          path="/gallery"
          element={
            <GalleryHome />
          }
        />

        <Route
          path="/gallery/:categorySlug"
          element={
            <CategoryGallery />
          }
        />

        <Route
          path="/admin"
          element={
            <Navigate to="/admin/dashboard" replace />
          }
        />

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/images"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminImages />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/upload"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminUpload />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <NotFound />
          }
        />
      </Routes>

      {isPublicPage && (
        <Footer onNavigate={handleNav} />
      )}
    </div>
  );
}

export default function App() {
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
        <AppContent theme={theme} onToggleTheme={toggleTheme} />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
