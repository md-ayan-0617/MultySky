import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import MasterDashboard from './pages/MasterDashboard';
import DisplayScreen from './pages/DisplayScreen';
import { createSession } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  // Check URL query parameters on initial load
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

  return (
    <div className="app-container">
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
    </div>
  );
}
