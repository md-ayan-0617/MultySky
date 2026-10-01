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
    if (media?.duration) setDuration(media.duration);
    if (socket) {
      socket.emit('change-media', { sessionId, media });
    }
  };

  useEffect(() => {
    if (session?.media?.duration) {
      setDuration(session.media.duration);
    }
  }, [session?.media?.id, setDuration]);

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
        background: 'var(--nm-surface)',
        boxShadow: '0 8px 24px var(--nm-dark-shadow)',
        borderBottom: 'var(--border-card)',
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
              <div className="nm-icon-box" style={{ width: '38px', height: '38px', borderRadius: '10px', color: 'var(--accent-cyan)' }}>
                <Smartphone size={20} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>
                Multi<span style={{ color: 'var(--accent-cyan)' }}>Screen</span>
              </span>
            </div>

            <div style={{
              background: 'var(--nm-surface-dark)',
              boxShadow: 'var(--nm-inset-sm)',
              border: 'var(--border-card)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Session</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '1px', fontSize: '0.92rem' }}>
                {sessionId}
              </span>
            </div>

            <span className="badge badge-connected">
              <span className="status-dot dot-connected" />
              {devices.filter(d => d.status !== 'disconnected').length} Phone(s)
            </span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsQrOpen(true)}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              <QrCode size={16} /> Pair Devices (QR)
            </button>

            <button
              onClick={() => setIsEndSessionOpen(true)}
              className="btn-danger"
              style={{ padding: '9px 16px', fontSize: '0.88rem' }}
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
          onLoadedMetadata={(meta) => {
            if (meta?.duration) setDuration(meta.duration);
          }}
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
          <div className="nm-card" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: 'var(--nm-raised-lg), 0 0 35px var(--btn-danger-hover-glow)',
            border: '1px solid var(--btn-danger-border)',
            borderRadius: 'var(--radius-xl)'
          }}>
            {/* Glowing Red Power Icon */}
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, var(--accent-rose), #be123c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px',
              color: '#fff',
              boxShadow: '6px 6px 16px var(--nm-dark-shadow), -6px -6px 16px var(--nm-light-shadow), 0 0 30px var(--btn-danger-hover-glow)'
            }}>
              <Power size={36} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              End Session
            </h3>

            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: '8px' }}>
              Are you sure?
            </p>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.55 }}>
              Ending this session will disconnect all connected display phones and return them to the home screen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <button
                onClick={() => setIsEndSessionOpen(false)}
                className="btn-secondary"
                disabled={isEnding}
                style={{ padding: '14px', fontSize: '0.95rem' }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmEndSession}
                className="btn-danger"
                disabled={isEnding}
                style={{
                  padding: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 700
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
