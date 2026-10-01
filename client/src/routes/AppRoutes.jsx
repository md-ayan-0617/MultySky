import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import CreateSession from '../pages/CreateSession';
import JoinSession from '../pages/JoinSession';
import MasterDashboard from '../pages/MasterDashboard';
import DisplayScreen from '../pages/DisplayScreen';
import NotFound from '../pages/NotFound';

// Gallery Pages
import GalleryHome from '../pages/gallery/GalleryHome';
import CategoryGallery from '../pages/gallery/CategoryGallery';

// Admin CMS Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminLayout from '../components/admin/AdminLayout';
import ProtectedAdminRoute from '../components/admin/ProtectedAdminRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminImages from '../pages/admin/AdminImages';
import AdminUpload from '../pages/admin/AdminUpload';
import AdminSettings from '../pages/admin/AdminSettings';

// Layout Wrappers
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AppRoutes({ theme, onToggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path should show public Header and Footer
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
    else if (target === 'display') navigate(`/display/${params.sessionId}?deviceId=${params.deviceId}&deviceName=${encodeURIComponent(params.deviceName || '')}`);
  };

  return (
    <>
      {isPublicPage && (
        <Header
          currentPage={getPageIdentifier()}
          onNavigate={handleNav}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}

      <Routes>
        {/* Public & Session Routes */}
        <Route path="/" element={<Home onNavigate={handleNav} />} />
        <Route path="/create-session" element={<CreateSession onNavigate={handleNav} onCreated={(s) => navigate(`/session/${s.id}`)} />} />
        <Route path="/join" element={<JoinSession onNavigate={handleNav} onJoined={(s, d) => navigate(`/display/${s.id}?deviceId=${d.id}&deviceName=${encodeURIComponent(d.name)}`)} />} />
        <Route path="/join/:sessionId" element={<JoinSession onNavigate={handleNav} onJoined={(s, d) => navigate(`/display/${s.id}?deviceId=${d.id}&deviceName=${encodeURIComponent(d.name)}`)} />} />
        
        {/* Master Controller */}
        <Route path="/session/:sessionId" element={<MasterDashboard theme={theme} onToggleTheme={onToggleTheme} />} />
        
        {/* Display Screen */}
        <Route path="/display/:sessionId" element={<DisplayScreen onNavigate={handleNav} />} />

        {/* Public Gallery */}
        <Route path="/gallery" element={<GalleryHome />} />
        <Route path="/gallery/:categorySlug" element={<CategoryGallery />} />

        {/* Admin Authentication */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin CMS Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isPublicPage && (
        <Footer onNavigate={handleNav} />
      )}
    </>
  );
}
