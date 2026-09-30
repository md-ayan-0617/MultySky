import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Power, Settings, RefreshCw, Radio, Layers, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import LayoutSelector from '../components/LayoutSelector';
import DeviceList from '../components/DeviceList';
import MediaLibrary from '../components/MediaLibrary';
import PlaybackControls from '../components/PlaybackControls';
import BezelSettings from '../components/BezelSettings';
import MultiScreenSimulator from '../components/MultiScreenSimulator';
import { useSession } from '../hooks/useSession';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { updateLayout, endSession, updateDevicePosition, removeDevice, getServerInfo } from '../services/api';

export default function MasterDashboard({ sessionId, onNavigate }) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Hook for session state & socket events
  const { session, isConnected, socket, clockOffset } = useSession({
    sessionId,
    role: 'master',
    deviceId: 'master-controller',
    deviceName: 'Master Controller'
  });

  // Hook for synchronized playback
  const {
    isPlaying,
    currentTime,
    duration,
    setDuration,
    play,
    pause,
    seek,
    restart,
    interactiveState,
    triggerInteractive
  } = usePlaybackSync({
    sessionId,
    isMaster: true,
    clockOffset
  });

  // Fetch server IP info for mobile QR pairing
  useEffect(() => {
    getServerInfo().then(setServerInfo).catch(console.warn);
  }, []);

  // Socket action handlers
  const handleSelectLayout = (layoutId) => {
    if (socket) {
      socket.emit('change-layout', { sessionId, layoutId });
    } else {
      updateLayout(sessionId, layoutId);
    }
  };

  const handleSelectMedia = (media) => {
    if (socket) {
      socket.emit('change-media', { sessionId, media });
    }
  };

  const handleUpdatePosition = (deviceId, newIndex) => {
    if (socket) {
      socket.emit('change-device-position', { sessionId, deviceId, newIndex });
    } else {
      updateDevicePosition(sessionId, deviceId, newIndex);
    }
  };

  const handleRemoveDevice = (deviceId) => {
    removeDevice(sessionId, deviceId);
  };

  const handleUpdateBezel = (bezel) => {
    if (socket) {
      socket.emit('update-bezel', { sessionId, bezel });
    }
  };

  const handleConfirmEndSession = async () => {
    setIsEnding(true);
    try {
      if (socket) {
        socket.emit('end-session', { sessionId });
      }
      await endSession(sessionId);
      onNavigate('home');
    } catch (err) {
      console.error('Failed to end session:', err);
      onNavigate('home');
    } finally {
      setIsEnding(false);
      setIsEndSessionOpen(false);
    }
  };

  const handleBroadcastFullscreen = () => {
    if (socket) {
      socket.emit('broadcast-fullscreen', { sessionId });
    }
    // Also toggle fullscreen locally if possible
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const currentLayout = session?.layout || { id: '2x2', rows: 2, cols: 2, total: 4 };
  const currentMedia = session?.media;
  const currentBezel = session?.bezel || { gapX: 3, gapY: 3, scale: 100, offsetX: 0, offsetY: 0 };
  const devices = session?.devices || [];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: 'rgba(15, 17, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Brand & Session Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              onClick={() => onNavigate('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
              }}>
                <Smartphone size={20} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Multi<span style={{ color: '#38bdf8' }}>Screen</span>
              </span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Session</span>
              <span style={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '1px', fontSize: '0.9rem' }}>
                {sessionId}
              </span>
            </div>

            <span className="badge badge-connected">
              <span className="status-dot dot-connected" />
              {devices.filter(d => d.status !== 'disconnected').length} Phone(s)
            </span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsQrOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <QrCode size={16} /> Pair Devices (QR)
            </button>

            <button
              onClick={() => setIsEndSessionOpen(true)}
              className="btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Power size={16} /> End
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Row 1: Live Simulator Wall (Centerpiece Showcase) */}
        <MultiScreenSimulator
          layout={currentLayout}
          devices={devices}
          media={currentMedia}
          bezel={currentBezel}
          isPlaying={isPlaying}
          currentTime={currentTime}
          interactiveState={interactiveState}
          onTriggerInteractive={triggerInteractive}
        />

        {/* Row 2: Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlay={play}
          onPause={pause}
          onSeek={seek}
          onRestart={restart}
          media={currentMedia}
          interactiveState={interactiveState}
          onTriggerInteractive={triggerInteractive}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(prev => !prev)}
          volume={volume}
          onVolumeChange={setVolume}
          onToggleFullscreen={handleBroadcastFullscreen}
        />

        {/* Row 3: Layout Configuration & Device Management (2 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <LayoutSelector
            currentLayout={currentLayout}
            onSelectLayout={handleSelectLayout}
          />

          <DeviceList
            devices={devices}
            layout={currentLayout}
            onUpdatePosition={handleUpdatePosition}
            onRemoveDevice={handleRemoveDevice}
            onOpenQR={() => setIsQrOpen(true)}
          />
        </div>

        {/* Row 4: Media Library */}
        <MediaLibrary
          currentMedia={currentMedia}
          onSelectMedia={handleSelectMedia}
          sessionId={sessionId}
        />

        {/* Row 5: Bezel and Gap Adjustments */}
        <BezelSettings
          bezel={currentBezel}
          onUpdateBezel={handleUpdateBezel}
        />
      </main>

      {/* QR Code Pairing Modal */}
      <QRCodeModal
        sessionId={sessionId}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        connectedCount={devices.length}
        serverInfo={serverInfo}
      />

      {/* FR-15: Session Termination Confirmation Modal */}
      {isEndSessionOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 15, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '380px',
            width: '100%',
            background: 'rgba(20, 24, 38, 0.95)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '24px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(244, 63, 94, 0.25)',
            animation: 'glowPulse 3s infinite'
          }}>
            {/* Glowing Red Power Icon (Matching PRD FR-15 mockup) */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f43f5e 0%, #be123c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#fff',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)'
            }}>
              <Power size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              End Session
            </h3>

            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fda4af', marginBottom: '8px' }}>
              Are you sure?
            </p>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>
              Ending this session will disconnect all connected display phones and return them to the home screen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setIsEndSessionOpen(false)}
                className="btn-secondary"
                disabled={isEnding}
                style={{ padding: '12px', fontSize: '0.95rem' }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmEndSession}
                className="btn-danger"
                disabled={isEnding}
                style={{
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)'
                }}
              >
                {isEnding ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
