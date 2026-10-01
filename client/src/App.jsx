import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import MasterDashboard from './pages/MasterDashboard';
import DisplayScreen from './pages/DisplayScreen';
import { createSession } from './services/api';

// ── Global Theme Toggle Button (shown on all non-master pages) ──────────────
function FloatingThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'fixed',
        top: '18px',
        right: '18px',
        zIndex: 9999,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'var(--border-card)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--nm-surface)',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '1.25rem',
        lineHeight: 1,
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(12deg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(12deg)';
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  // ── Theme state — default to warm playful clay (light) ──────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ms-theme') || 'light';
  });

  // Apply data-theme to <body> and persist whenever theme changes
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('ms-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── URL-based routing on initial load ────────────────────────────────────
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    const masterCode = urlParams.get('master');
    const displaySession = urlParams.get('display');
    const deviceId = urlParams.get('deviceId');
    const deviceName = urlParams.get('deviceName');

    if (displaySession) {
      setCurrentPage('display');
      setRouteParams({
        sessionId: displaySession,
        deviceId: deviceId || `dev-${Date.now()}`,
        deviceName: deviceName || 'Phone Screen'
      });
    } else if (joinCode) {
      setCurrentPage('join');
      setRouteParams({ initialCode: joinCode });
    } else if (masterCode) {
      setCurrentPage('master');
      setRouteParams({ sessionId: masterCode });
    }
  }, []);

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setRouteParams(params);
    window.scrollTo(0, 0);
  };

  // Instant Quick Start for Virtual Cake Party
  const handleQuickStartCake = async () => {
    try {
      const res = await createSession({
        layoutId: '2x2',
        initialMedia: {
          id: 'exp-cake-1',
          name: 'Virtual Birthday Cake Party (Interactive)',
          type: 'interactive',
          category: 'Interactive',
          subType: 'cake',
          thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
        }
      });
      if (res?.success && res.session) {
        navigate('master', { sessionId: res.session.id });
      }
    } catch (err) {
      console.error(err);
      navigate('create');
    }
  };

  // Instant Quick Start for Cyber Wave Matrix
  const handleQuickStartCyber = async () => {
    try {
      const res = await createSession({
        layoutId: '2x2',
        initialMedia: {
          id: 'exp-cyber-1',
          name: 'Cyber Wave Matrix (Interactive)',
          type: 'interactive',
          category: 'Interactive',
          subType: 'cyber',
          thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
        }
      });
      if (res?.success && res.session) {
        navigate('master', { sessionId: res.session.id });
      }
    } catch (err) {
      console.error(err);
      navigate('create');
    }
  };

  const showHeaderFooter = currentPage === 'home' || currentPage === 'create' || currentPage === 'join';

  return (
    <div className="app-container">
      {/* Polished Claymorphism Header */}
      {showHeaderFooter && (
        <Header
          currentPage={currentPage}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentPage === 'home' && (
        <Home
          onNavigate={navigate}
          onQuickStartCake={handleQuickStartCake}
          onQuickStartCyber={handleQuickStartCyber}
        />
      )}

      {currentPage === 'create' && (
        <CreateSession
          onNavigate={navigate}
          onCreated={(session) => navigate('master', { sessionId: session.id })}
        />
      )}

      {currentPage === 'join' && (
        <JoinSession
          onNavigate={navigate}
          initialCode={routeParams.initialCode}
          onJoined={(session, device) => navigate('display', {
            sessionId: session.id,
            deviceId: device.id,
            deviceName: device.name
          })}
        />
      )}

      {currentPage === 'master' && (
        <MasterDashboard
          sessionId={routeParams.sessionId}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentPage === 'display' && (
        <DisplayScreen
          sessionId={routeParams.sessionId}
          deviceId={routeParams.deviceId}
          deviceName={routeParams.deviceName}
          onNavigate={navigate}
        />
      )}

      {/* Polished Claymorphism Footer */}
      {showHeaderFooter && (
        <Footer onNavigate={navigate} />
      )}
    </div>
  );
}
