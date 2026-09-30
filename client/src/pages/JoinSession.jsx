import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowLeft, ArrowRight, QrCode, Sparkles } from 'lucide-react';
import { joinSession } from '../services/api';

export default function JoinSession({ onNavigate, initialCode = '', onJoined }) {
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [deviceName, setDeviceName] = useState(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (/iPhone/i.test(navigator.userAgent)) return 'iPhone Display';
    if (/Android/i.test(navigator.userAgent)) return 'Android Display';
    return isMobile ? 'Mobile Display' : 'Screen Device';
  });
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialCode) {
      setSessionCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setIsJoining(true);
    setError(null);

    const deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await joinSession({
        sessionId: sessionCode.trim().toUpperCase(),
        deviceId,
        deviceName: deviceName.trim(),
        userAgent: navigator.userAgent
      });

      if (res?.success) {
        if (onJoined) {
          onJoined(res.session, res.device);
        } else {
          onNavigate('display', {
            sessionId: res.session.id,
            deviceId: res.device.id,
            deviceName: res.device.name
          });
        }
      } else {
        setError(res?.message || 'Failed to join session. Check code.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to session. Ensure the master device is running.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }}>
      <button
        onClick={() => onNavigate('home')}
        className="btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="glass-panel" style={{ padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: '#22d3ee',
            marginBottom: '12px'
          }}>
            <Smartphone size={16} /> Join Multi-Phone Wall
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '8px' }}>
            Pair Display Phone
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter the 6-character session code shown on the master screen.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Session Code Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>
              Session Code
            </label>
            <input
              type="text"
              placeholder="e.g. MS-7F42A9"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '14px 16px',
                color: '#fff',
                fontSize: '1.25rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '2px',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          {/* Device Nickname */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>
              Device Nickname
            </label>
            <input
              type="text"
              placeholder="e.g. My Phone"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isJoining}
            className="btn-primary"
            style={{
              padding: '16px',
              fontSize: '1.05rem',
              marginTop: '10px'
            }}
          >
            {isJoining ? 'Connecting to Wall...' : <>Connect Display Device <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
