import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Power, Settings, RefreshCw, Radio, Layers, Volume2, Sparkles, ExternalLink, Clock, Maximize2, ShieldAlert, Check, X, Eye, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
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
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [identifiedDeviceId, setIdentifiedDeviceId] = useState(null);
  const [timerDuration, setTimerDuration] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [blackout, setBlackout] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState(null); // 'join' | 'exit' | null

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

  // Master Grid Display Integration (Requirement 1, 2, 3)
  const masterDisplayDevice = devices.find(d => d.isMaster && d.status !== 'disconnected');
  const isMasterInGrid = !!masterDisplayDevice || !!session?.masterJoinedGrid;

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

  // Socket handlers
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

  // Synchronized Timer handlers (Requirement 9)
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

  // Listen for timer synchronization
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

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <header style={{
        background: 'var(--nm-surface)',
        borderBottom: 'var(--border-card)',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
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
          {/* Brand & Session Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              onClick={() => onNavigate('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div className="nm-icon-box" style={{ width: '38px', height: '38px', color: 'var(--accent-cyan)', background: 'var(--nm-surface-light)' }}>
                <Smartphone size={20} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>
                Multi<span style={{ color: 'var(--accent-primary)' }}>Screen</span>
              </span>
            </div>

            <div style={{
              background: 'var(--nm-surface-light)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Session</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '1px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                {sessionId}
              </span>
            </div>

            <span className="badge badge-ready">
              CONNECTED: {connectedCount} / {totalSlots}
            </span>

            {pendingDevices.length > 0 && (
              <span className="badge badge-pending">
                {pendingDevices.length} Pending
              </span>
            )}
          </div>

          {/* Quick Global Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isMasterInGrid ? (
              <button
                onClick={handleOpenMasterDisplay}
                className="btn-primary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  background: 'var(--clay-lavender)',
                  color: '#271E47',
                  boxShadow: 'var(--clay-shadow-lavender)'
                }}
              >
                <Maximize2 size={15} /> Open Display Mode
              </button>
            ) : (
              <button
                onClick={() => handleMasterJoinGrid(0)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                title="Use this master phone as one of the physical screens in the grid"
              >
                <Smartphone size={15} color="var(--clay-coral)" /> Join Grid
              </button>
            )}

            <button
              onClick={handleToggleBlackout}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                background: blackout ? '#000' : undefined,
                color: blackout ? 'var(--accent-rose)' : undefined,
                border: blackout ? '1px solid var(--accent-rose)' : undefined
              }}
            >
              {blackout ? 'Exit Blackout' : 'Blackout Screens'}
            </button>

            <button
              onClick={handleBroadcastFullscreen}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Maximize2 size={15} /> Enter Display Mode All
            </button>

            <button
              onClick={() => setIsQrOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <QrCode size={15} /> Pair Phones (QR)
            </button>

            <button
              onClick={() => setIsEndSessionOpen(true)}
              className="btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Power size={15} /> End
            </button>
          </div>
        </div>
      </header>

      {/* ── Pending Device Approval Banner (Requirement 14) ──────────────── */}
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
      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Master Phone Grid Banner (Requirement 1, 2, 3) */}
        {isMasterInGrid ? (
          <div
            className="clay-card clay-card-mint animate-fade-in"
            style={{
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#144026',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Check size={24} strokeWidth={2.8} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#144026' }}>
                    {masterDisplayDevice?.deviceCode || 'P01'} ● MASTER DISPLAY
                  </span>
                  <span className="badge badge-ready" style={{ background: '#FFFFFF', color: '#166534', padding: '3px 12px' }}>
                    ✓ IN GRID
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#195431', marginTop: '2px', fontWeight: 600 }}>
                  Position: {masterDisplayDevice?.position?.label || 'Slot 1'} • Active in synchronized playback & cake countdown
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Slot Selector */}
              <select
                value={masterDisplayDevice?.position?.index ?? 0}
                onChange={(e) => handleUpdatePosition(masterDisplayDevice.id, parseInt(e.target.value, 10))}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FFFFFF',
                  border: '2px solid rgba(20, 64, 38, 0.2)',
                  color: '#144026',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {Array.from({ length: totalSlots }).map((_, sIdx) => (
                  <option key={sIdx} value={sIdx}>
                    Move to Slot P{String(sIdx + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenMasterDisplay}
                className="btn-primary"
                style={{
                  background: '#144026',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 6px 14px -2px rgba(20, 64, 38, 0.4)'
                }}
              >
                <Maximize2 size={16} /> ENTER DISPLAY MODE
              </button>

              <button
                onClick={handleMasterLeaveGrid}
                className="btn-secondary"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}
                title="Remove Master from display grid while keeping controller and session alive"
              >
                <X size={16} /> LEAVE GRID
              </button>
            </div>
          </div>
        ) : (
          <div
            className="clay-card clay-card-lavender animate-fade-in"
            style={{
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#271E47',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Smartphone size={22} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#271E47' }}>
                  Use This Master Phone as a Screen in the Grid
                </div>
                <div style={{ fontSize: '0.88rem', color: '#3A2E63', marginTop: '2px' }}>
                  Participate as physical screen P01 in synchronized videos, photos, and cake timers while retaining full controller access.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleMasterJoinGrid(0)}
              className="btn-primary"
              style={{
                background: '#271E47',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 18px -4px rgba(39, 30, 71, 0.45)'
              }}
            >
              <Smartphone size={18} /> JOIN GRID
            </button>
          </div>
        )}

        {/* Row 1: Live Simulator Wall (Centerpiece Showcase, Scalable 1-100) */}
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

        {/* Row 2: Playback Controls & Synchronized Timer Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Media Playback Controls */}
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

          {/* Synchronized Countdown Timer Widget (Requirement 9) */}
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
                      background: timerDuration === sec ? 'rgba(99, 102, 241, 0.2)' : undefined,
                      borderColor: timerDuration === sec ? 'var(--accent-primary)' : undefined
                    }}
                  >
                    {sec}s Timer
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Actions */}
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

        {/* Row 3: Independent JOIN / EXIT Media Controls (Requirement 6) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>Join & Exit Screen Transitions</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Independent visuals displayed when a phone enters or leaves the grid wall
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Join Media */}
            <div style={{
              background: 'var(--nm-surface-light)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={session?.joinMedia?.thumbnail || session?.joinMedia?.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100'}
                  alt="Join Media"
                  style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>JOIN MEDIA</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>{session?.joinMedia?.name || 'Welcome Flash'}</div>
                </div>
              </div>

              <button
                onClick={() => setMediaPickerType('join')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Select Join Media
              </button>
            </div>

            {/* Exit Media */}
            <div style={{
              background: 'var(--nm-surface-light)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={session?.exitMedia?.thumbnail || session?.exitMedia?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100'}
                  alt="Exit Media"
                  style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>EXIT MEDIA</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>{session?.exitMedia?.name || 'Farewell Pulse'}</div>
                </div>
              </div>

              <button
                onClick={() => setMediaPickerType('exit')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Select Exit Media
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Grid Layout Configuration (1-100 phones) & Device Management */}
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
            onIdentifyDevice={handleIdentifyDevice}
            onApproveDevice={handleApproveDevice}
            onRejectDevice={handleRejectDevice}
            identifiedDeviceId={identifiedDeviceId}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={(dev) => setSelectedDeviceId(dev.id)}
          />
        </div>

        {/* Row 5: Media Library (Superheroes, Pop Culture, Celebration, Space, etc.) */}
        <MediaLibrary
          currentMedia={currentMedia}
          onSelectMedia={handleSelectMedia}
          sessionId={sessionId}
        />

        {/* Row 6: Bezel & Gap Adjustments */}
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

      {/* Join/Exit Media Picker Overlay Modal */}
      {mediaPickerType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '960px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ color: '#fff' }}>
                Select {mediaPickerType === 'join' ? 'JOIN MEDIA (Entrance)' : 'EXIT MEDIA (Departure)'}
              </h3>
              <button onClick={() => setMediaPickerType(null)} className="nm-btn-circle" style={{ width: '36px', height: '36px' }}>
                <X size={18} />
              </button>
            </div>
            <MediaLibrary
              currentMedia={mediaPickerType === 'join' ? session?.joinMedia : session?.exitMedia}
              onSelectMedia={handleSelectMedia}
              sessionId={sessionId}
            />
          </div>
        </div>
      )}

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
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: 'var(--accent-rose)'
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
