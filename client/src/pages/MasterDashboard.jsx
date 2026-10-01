import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Smartphone, QrCode, Power, Settings, RefreshCw, Radio, Layers, Volume2, 
  Sparkles, ExternalLink, Clock, Maximize2, ShieldAlert, Check, X, Eye, 
  Play, Pause, RotateCcw, AlertTriangle 
} from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import LayoutSelector from '../components/LayoutSelector';
import DeviceList from '../components/DeviceList';
import MediaLibrary from '../components/MediaLibrary';
import PlaybackControls from '../components/PlaybackControls';
import BezelSettings from '../components/BezelSettings';
import MultiScreenSimulator from '../components/MultiScreenSimulator';
import SessionControlPanel from '../components/SessionControlPanel';
import AnimationModeSelector from '../components/AnimationModeSelector';
import CustomMessageInput from '../components/CustomMessageInput';
import CyberWaveControls from '../components/CyberWaveControls';
import CakePartyControls from '../components/CakePartyControls';

import { useSession } from '../hooks/useSession';
import { usePlaybackSync } from '../hooks/usePlaybackSync';
import { updateLayout, endSession, updateDevicePosition, removeDevice, getServerInfo } from '../services/api';

export default function MasterDashboard({ sessionId: propSessionId, onNavigate: propOnNavigate, theme, onToggleTheme }) {
  const params = useParams();
  const routerNavigate = useNavigate();
  const sessionId = propSessionId || params.sessionId;

  const onNavigate = (page, p = {}) => {
    if (propOnNavigate) {
      propOnNavigate(page, p);
    } else {
      if (page === 'home') routerNavigate('/');
      else if (page === 'create') routerNavigate('/create-session');
      else if (page === 'join') routerNavigate('/join');
      else if (page === 'display') routerNavigate(`/display/${p.sessionId || sessionId}?deviceId=${p.deviceId}&deviceName=${encodeURIComponent(p.deviceName || '')}`);
      else if (page === 'master') routerNavigate(`/session/${p.sessionId || sessionId}`);
      else if (page === 'gallery') routerNavigate('/gallery');
      else if (page === 'admin') routerNavigate('/admin');
    }
  };

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [identifiedDeviceId, setIdentifiedDeviceId] = useState(null);
  const [timerDuration, setTimerDuration] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [blackout, setBlackout] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState(null); // 'join' | 'exit' | null

  // Active animation mode state (default to cyber-wave)
  const [activeMode, setActiveMode] = useState('cyber-wave');

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

  useEffect(() => {
    getServerInfo().then(setServerInfo).catch(console.warn);
  }, []);

  const currentLayout = session?.layout || { id: '2x2', rows: 2, cols: 2, total: 4 };
  const currentMedia = session?.media;
  const currentBezel = session?.bezel || { gapX: 3, gapY: 3, scale: 100, offsetX: 0, offsetY: 0 };
  const devices = session?.devices || [];
  const totalSlots = Math.min(100, Math.max(1, currentLayout.total || (currentLayout.rows * currentLayout.cols) || 4));
  const connectedCount = devices.filter(d => d.status === 'ready').length;
  const pendingDevices = devices.filter(d => d.status === 'pending');

  // Master Grid Display Integration
  const masterDisplayDevice = devices.find(d => d.isMaster && d.status !== 'disconnected');
  const isMasterInGrid = !!masterDisplayDevice || !!session?.masterJoinedGrid;

  // Sync activeMode if session media changes
  useEffect(() => {
    if (session?.media?.subType === 'cake') {
      setActiveMode('cake');
    } else if (session?.media?.subType === 'cyber' || session?.media?.id === 'exp-cyber-1') {
      setActiveMode('cyber-wave');
    }
  }, [session?.media?.id, session?.media?.subType]);

  const handleMasterJoinGrid = (preferredIndex = 0) => {
    if (socket) {
      socket.emit('master:join-grid', { sessionId, preferredIndex });
    }
  };

  const handleMasterLeaveGrid = () => {
    if (socket) {
      socket.emit('master:leave-grid', { sessionId });
    }
  };

  const handleOpenMasterDisplay = () => {
    onNavigate('display', {
      sessionId,
      deviceId: masterDisplayDevice?.id || `master-disp-${sessionId}`,
      deviceName: 'Master Display (Host)'
    });
  };

  const handleSelectLayout = (layout) => {
    const layoutId = typeof layout === 'object' ? layout.id : layout;
    if (socket) {
      socket.emit('change-layout', { sessionId, layoutId, layout });
    } else {
      updateLayout(sessionId, layoutId);
    }
  };

  const handleSelectMedia = (media) => {
    if (mediaPickerType === 'join') {
      if (socket) socket.emit('update-join-exit-media', { sessionId, joinMedia: media });
      setMediaPickerType(null);
      return;
    }
    if (mediaPickerType === 'exit') {
      if (socket) socket.emit('update-join-exit-media', { sessionId, exitMedia: media });
      setMediaPickerType(null);
      return;
    }

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
    if (socket) {
      socket.emit('remove-device', { sessionId, deviceId });
    } else {
      removeDevice(sessionId, deviceId);
    }
  };

  const handleIdentifyDevice = (deviceId) => {
    setIdentifiedDeviceId(deviceId);
    if (socket) {
      socket.emit('device-identify', { sessionId, deviceId });
    }
    setTimeout(() => {
      setIdentifiedDeviceId(prev => (prev === deviceId ? null : prev));
    }, 4500);
  };

  const handleApproveDevice = (deviceId) => {
    if (socket) {
      socket.emit('device:approve', { sessionId, deviceId });
    }
  };

  const handleRejectDevice = (deviceId) => {
    if (socket) {
      socket.emit('device:reject', { sessionId, deviceId });
    }
  };

  const handleApproveAll = () => {
    pendingDevices.forEach(d => handleApproveDevice(d.id));
  };

  const handleUpdateBezel = (bezel) => {
    if (socket) {
      socket.emit('update-bezel', { sessionId, bezel });
    }
  };

  const handleBroadcastFullscreen = () => {
    if (socket) {
      socket.emit('broadcast-fullscreen', { sessionId });
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleToggleBlackout = () => {
    const next = !blackout;
    setBlackout(next);
    if (socket) {
      socket.emit('display:blackout', { sessionId, blackout: next });
    }
  };

  // Synchronized Timer handlers
  const handleStartTimer = (sec = timerDuration) => {
    setTimerDuration(sec);
    setTimerActive(true);
    if (socket) {
      socket.emit('timer:start', { sessionId, duration: sec });
    }
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
    if (socket) {
      socket.emit('timer:pause', { sessionId });
    }
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerRemaining(null);
    if (socket) {
      socket.emit('timer:reset', { sessionId, duration: timerDuration });
    }
  };

  // Timer sync listener
  useEffect(() => {
    if (!socket) return;
    let interval = null;
    const handleTimerSync = (data) => {
      const timer = data?.timer;
      if (timer?.isRunning && timer?.targetTimestamp) {
        setTimerActive(true);
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
          const now = Date.now() + (clockOffset || 0);
          const diff = Math.max(0, Math.ceil((timer.targetTimestamp - now) / 1000));
          setTimerRemaining(diff);
          if (diff <= 0) {
            clearInterval(interval);
            setTimerActive(false);
          }
        }, 100);
      } else {
        setTimerActive(false);
        if (interval) clearInterval(interval);
        setTimerRemaining(null);
      }
    };

    socket.on('timer-sync', handleTimerSync);
    return () => {
      socket.off('timer-sync', handleTimerSync);
      if (interval) clearInterval(interval);
    };
  }, [socket, clockOffset]);

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

  // Mode change handler
  const handleSelectMode = (modeId) => {
    setActiveMode(modeId);
    if (modeId === 'cake') {
      handleSelectMedia({
        id: 'exp-cake-1',
        name: 'Virtual Birthday Cake Party (Interactive)',
        type: 'interactive',
        category: 'Interactive',
        subType: 'cake',
        thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
      });
    } else {
      handleSelectMedia({
        id: 'exp-cyber-1',
        name: 'Cyber Wave Matrix (Interactive)',
        type: 'interactive',
        category: 'Interactive',
        subType: 'cyber',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
      });
    }
  };

  const handleUpdateCustomText = (text) => {
    triggerInteractive('CUSTOM_TEXT', { text });
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ── Compact Mobile Console Header ───────────────────────────────── */}
      <SessionControlPanel
        sessionId={sessionId}
        connectedCount={connectedCount}
        totalSlots={totalSlots}
        pendingCount={pendingDevices.length}
        isMasterInGrid={isMasterInGrid}
        blackout={blackout}
        onOpenDisplayMode={handleOpenMasterDisplay}
        onJoinGrid={() => handleMasterJoinGrid(0)}
        onPairPhones={() => setIsQrOpen(true)}
        onToggleBlackout={handleToggleBlackout}
        onEndSession={() => setIsEndSessionOpen(true)}
        onApproveAllPending={handleApproveAll}
      />

      {/* ── Pending Device Approval Alert Banner ────────────────────────── */}
      {pendingDevices.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '12px 24px'
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: 600 }}>
                {pendingDevices.length} phone(s) waiting for access approval:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {pendingDevices.map(d => (
                  <span key={d.id} style={{ background: 'var(--nm-surface)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    {d.name} ({d.deviceCode})
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleApproveAll}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--accent-emerald)' }}
            >
              <Check size={14} /> Approve All Phones
            </button>
          </div>
        </div>
      )}

      {/* ── Main Dashboard Body ──────────────────────────────────────────── */}
      <main style={{ maxWidth: '1440px', margin: '20px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: Connected Devices / Live Grid Wall (Moved Upward) */}
        <MultiScreenSimulator
          layout={currentLayout}
          devices={devices}
          media={currentMedia}
          bezel={currentBezel}
          isPlaying={isPlaying}
          currentTime={currentTime}
          interactiveState={interactiveState}
          onTriggerInteractive={triggerInteractive}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={(dev) => setSelectedDeviceId(dev.id)}
          identifiedDeviceId={identifiedDeviceId}
          onIdentifyDevice={handleIdentifyDevice}
          onLoadedMetadata={(meta) => {
            if (meta?.duration) setDuration(meta.duration);
          }}
        />

        {/* SECTION 2: 5 Animation Modes Selector */}
        <AnimationModeSelector
          activeMode={activeMode}
          onSelectMode={handleSelectMode}
        />

        {/* SECTION 3: User-Controlled Animated Text Area */}
        <CustomMessageInput
          currentText={interactiveState?.customText || 'MULTISCREEN CYBER MATRIX'}
          onUpdateText={handleUpdateCustomText}
        />

        {/* SECTION 4: Mode-Specific Controls */}
        {activeMode === 'cake' ? (
          /* Strictly conditional Cake Party controls */
          <CakePartyControls
            onTriggerInteractive={triggerInteractive}
            timerRemaining={timerRemaining}
            timerActive={timerActive}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
          />
        ) : (
          /* Default Cyber Wave Matrix Controls */
          <CyberWaveControls
            interactiveState={interactiveState}
            onTriggerInteractive={triggerInteractive}
          />
        )}

        {/* SECTION 5: Media Playback & Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div style={{ flex: '2 1 400px' }}>
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
          </div>

          {/* Synchronized Timer Widget */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="nm-icon-box" style={{ width: '32px', height: '32px', color: 'var(--accent-amber)', background: 'var(--nm-surface-light)' }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--text-heading)' }}>Synchronized Timer</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger celebration on all {totalSlots} screens simultaneously</p>
                  </div>
                </div>

                {timerRemaining !== null && (
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {timerRemaining}s
                  </span>
                )}
              </div>

              {/* Preset Timer Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {[10, 5, 3].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleStartTimer(sec)}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: timerDuration === sec ? 'rgba(37, 99, 235, 0.2)' : undefined,
                      borderColor: timerDuration === sec ? 'var(--accent-primary)' : undefined
                    }}
                  >
                    {sec}s Timer
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleStartTimer(timerDuration)}
                disabled={timerActive}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                <Play size={14} /> Start Countdown
              </button>
              <button
                onClick={handlePauseTimer}
                disabled={!timerActive}
                className="btn-secondary"
                style={{ padding: '10px 14px' }}
              >
                <Pause size={14} />
              </button>
              <button
                onClick={handleResetTimer}
                className="btn-secondary"
                style={{ padding: '10px 14px' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: Grid Layout Configuration (1-100 phones) & Device Management */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
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
            onIdentifyDevice={handleIdentifyDevice}
            onApproveDevice={handleApproveDevice}
            onRejectDevice={handleRejectDevice}
            identifiedDeviceId={identifiedDeviceId}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={(dev) => setSelectedDeviceId(dev.id)}
          />
        </div>

        {/* SECTION 7: Media Library */}
        <MediaLibrary
          currentMedia={currentMedia}
          onSelectMedia={handleSelectMedia}
          sessionId={sessionId}
        />

        {/* SECTION 8: Bezel & Gap Adjustments */}
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

      {/* Session Termination Confirmation Modal */}
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
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#ef4444'
            }}>
              <Power size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              End Session
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Ending this session will disconnect all connected display phones and return them to the home screen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setIsEndSessionOpen(false)}
                className="btn-secondary"
                disabled={isEnding}
                style={{ padding: '12px' }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmEndSession}
                className="btn-danger"
                disabled={isEnding}
                style={{ padding: '12px' }}
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
