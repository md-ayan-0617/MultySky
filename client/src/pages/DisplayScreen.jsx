import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Info,
  ArrowLeft,
  Smartphone,
  AlertCircle,
  Sparkles,
  Check,
  ShieldAlert,
  Settings,
  ChevronLeft
} from 'lucide-react';
import CanvasDisplay from '../components/CanvasDisplay';
import VirtualCake from '../components/VirtualCake';
import CyberWave from '../components/CyberWave';
import PositionGuideModal from '../components/PositionGuideModal';
import { useSession } from '../hooks/useSession';
import { usePlaybackSync } from '../hooks/usePlaybackSync';

export default function DisplayScreen({ sessionId, deviceId, deviceName, onNavigate }) {
  const [inDisplayMode, setInDisplayMode] = useState(false);
  const [showPositionGuide, setShowPositionGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // YouTube-style tap controls
  const [isIdentified, setIsIdentified] = useState(false);
  const [joinAnimationActive, setJoinAnimationActive] = useState(true);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const wakeLockRef = useRef(null);

  // Hook for session & socket
  const { session, device, isConnected, clockOffset, socket } = useSession({
    sessionId,
    deviceId,
    role: 'display',
    deviceName
  });

  const isMasterPhone = device?.isMaster || device?.role === 'master+display' || session?.masterGridDeviceId === deviceId;

  // Hook for playback synchronization
  const {
    isPlaying,
    currentTime,
    interactiveState,
    triggerInteractive
  } = usePlaybackSync({
    sessionId,
    isMaster: false,
    clockOffset
  });

  // ── Wake Lock API (Keep display awake) ──────────────────────────────────────
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('💡 Screen Wake Lock acquired');
      }
    } catch (err) {
      console.warn('Wake Lock request error:', err.message);
    }
  };

  useEffect(() => {
    if (inDisplayMode) {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && inDisplayMode) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [inDisplayMode]);

  // ── Fullscreen API Handling ────────────────────────────────────────────────
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs && inDisplayMode) {
        // Exited fullscreen via ESC or swipe
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [inDisplayMode]);

  // ── Android Back Button Handling (Requirement 6) ───────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (inDisplayMode) {
        exitDisplayMode();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inDisplayMode]);

  const enterDisplayMode = () => {
    requestWakeLock();
    setShowPositionGuide(false);
    setInDisplayMode(true);
    setShowOverlay(false);

    // Push history state so Android / mobile hardware back exits display mode safely
    try {
      window.history.pushState({ inDisplayMode: true }, '');
    } catch (e) {
      // Ignore if pushState fails
    }

    if (!document.fullscreenElement) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
  };

  const exitDisplayMode = () => {
    setInDisplayMode(false);
    setShowOverlay(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ── Master Broadcast Fullscreen ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleFsRequest = () => {
      enterDisplayMode();
    };
    socket.on('fullscreen-requested', handleFsRequest);
    return () => socket.off('fullscreen-requested', handleFsRequest);
  }, [socket]);

  // ── Device Identification (Requirement 5) ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleIdentify = (data) => {
      if (data?.deviceId === deviceId || (isMasterPhone && data?.deviceId === 'master-controller')) {
        setIsIdentified(true);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        setTimeout(() => setIsIdentified(false), 4500);
      }
    };
    socket.on('device-identify', handleIdentify);
    return () => socket.off('device-identify', handleIdentify);
  }, [socket, deviceId, isMasterPhone]);

  // ── Join Media Entrance Flash (Requirement 6) ──────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setJoinAnimationActive(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // ── Synchronized Countdown Timer (Requirement 9 & 22) ──────────────────────
  useEffect(() => {
    if (!socket) return;

    let interval = null;
    const handleTimerSync = (data) => {
      const timerData = data?.timer || session?.timer;
      if (timerData?.isRunning && timerData?.targetTimestamp) {
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
          const now = Date.now() + (clockOffset || 0);
          const diff = Math.max(0, Math.ceil((timerData.targetTimestamp - now) / 1000));
          setTimerRemaining(diff);
          if (diff <= 0) {
            clearInterval(interval);
            setTimeout(() => setTimerRemaining(null), 3000);
          }
        }, 100);
      } else {
        if (interval) clearInterval(interval);
        setTimerRemaining(null);
      }
    };

    socket.on('timer-sync', handleTimerSync);
    return () => {
      socket.off('timer-sync', handleTimerSync);
      if (interval) clearInterval(interval);
    };
  }, [socket, clockOffset, session?.timer]);

  // ── YouTube-Style Auto-Dismiss Controls (Requirement 5) ────────────────────
  useEffect(() => {
    if (!showOverlay || !inDisplayMode) return;
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [showOverlay, inDisplayMode]);

  const layout = session?.layout || { rows: 2, cols: 2, total: 4 };
  const position = device?.position || { row: 0, col: 0, index: 0, label: 'Assigned Position' };
  const media = session?.media;
  const bezel = session?.bezel || { gapX: 3, gapY: 3, scale: 100, offsetX: 0, offsetY: 0 };
  const slotNumber = (position.index ?? 0) + 1;
  const phoneLabel = device?.deviceCode || `P${String(slotNumber).padStart(2, '0')}`;

  const isInteractiveCake = media?.type === 'interactive' && media?.subType === 'cake';
  const isInteractiveCyber = media?.type === 'interactive' && media?.subType === 'cyber';

  // Session Ended Screen
  if (session?.status === 'ended') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--clay-bg)',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div className="clay-card" style={{ padding: '36px', maxWidth: '420px', width: '100%' }}>
          <AlertCircle size={48} color="#FF806F" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--text-heading)', marginBottom: '8px', fontWeight: 900 }}>Session Ended</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            The master host has closed this multi-screen session.
          </p>
          <button onClick={() => onNavigate('home')} className="btn-primary" style={{ width: '100%' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Pending Host Approval Screen (Requirement 14)
  if (device?.status === 'pending') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--clay-bg)',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div className="clay-card clay-card-yellow" style={{ padding: '36px', maxWidth: '420px', width: '100%' }}>
          <ShieldAlert size={48} color="#854D0E" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#4A3A12', marginBottom: '8px', fontSize: '1.4rem', fontWeight: 900 }}>
            Waiting for Host Approval
          </h2>
          <p style={{ color: '#6A531A', marginBottom: '20px', fontSize: '0.92rem' }}>
            Your phone <strong>{device?.name || deviceName}</strong> ({phoneLabel}) is connected. Please wait for the host
            to approve your phone into the grid.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: '#FFFFFF',
              borderRadius: '20px',
              color: '#854D0E',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <span className="status-dot dot-pending" /> Approval Pending...
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE A: Minimal Non-Master Display Device Ready Screen (Before Display Mode)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!inDisplayMode) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--clay-bg)',
          padding: '24px 20px',
          textAlign: 'center'
        }}
      >
        <div
          className="clay-card"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '36px 24px',
            background: 'var(--clay-surface)'
          }}
        >
          {/* Top Back / Master Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => (isMasterPhone ? onNavigate('master', { sessionId }) : onNavigate('home'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                fontWeight: 700
              }}
            >
              <ChevronLeft size={18} /> {isMasterPhone ? 'Host Dashboard' : 'Leave'}
            </button>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--clay-coral)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Session: {sessionId}
            </span>
          </div>

          {/* Clay Phone Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: isMasterPhone ? 'var(--clay-lavender)' : 'var(--clay-mint)',
              boxShadow: isMasterPhone ? 'var(--clay-shadow-lavender)' : 'var(--clay-shadow-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: isMasterPhone ? '#271E47' : '#144026'
            }}
          >
            <Smartphone size={36} strokeWidth={2.4} />
          </div>

          {/* Slot Header */}
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Phone Ready ({phoneLabel})
          </h2>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(157, 222, 184, 0.25)',
              color: '#144026',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '16px'
            }}
          >
            <span className="status-dot dot-ready" /> {position.label || `Slot ${slotNumber}`}
            {isMasterPhone && ' • (Host Phone)'}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Place this phone in its spot on your display wall or table, then tap the button below. Screen will stay awake
            during the show.
          </p>

          {/* PRIMARY ACTION: ENTER DISPLAY MODE */}
          <button
            onClick={enterDisplayMode}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px 28px',
              fontSize: '1.05rem',
              fontWeight: 800,
              marginBottom: '14px'
            }}
          >
            <Maximize2 size={20} /> ENTER DISPLAY MODE
          </button>

          <button
            onClick={() => setShowPositionGuide(true)}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem' }}
          >
            <Info size={16} /> View Grid Position Map
          </button>
        </div>

        {/* Position Guide Modal */}
        <PositionGuideModal
          isOpen={showPositionGuide}
          onConfirm={() => {
            setShowPositionGuide(false);
            enterDisplayMode();
          }}
          layout={layout}
          devicePosition={position}
          deviceName={deviceName}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE B: FULL DISPLAY MODE (YouTube-Style Tap Controls, Zero Clutter)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      onClick={() => setShowOverlay((prev) => !prev)}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: session?.blackout ? '#000000' : '#000000',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Blackout Mode Display */}
      {session?.blackout ? (
        <div style={{ width: '100%', height: '100%', background: '#000000' }} />
      ) : (
        <>
          {/* Join Media Entrance Flash (Requirement 6) */}
          {joinAnimationActive && session?.joinMedia?.url && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 30,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.4s ease'
              }}
            >
              <img
                src={session.joinMedia.url}
                alt="Join Media"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div
                style={{
                  position: 'absolute',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--clay-coral)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Connected to MultiScreen</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--clay-yellow)', marginTop: '4px', fontWeight: 700 }}>
                  Assigned Slot {slotNumber} ({phoneLabel})
                </div>
              </div>
            </div>
          )}

          {/* Main Sliced Canvas Media */}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {isInteractiveCake ? (
              <VirtualCake
                row={position.row}
                col={position.col}
                totalRows={layout.rows}
                totalCols={layout.cols}
                interactiveState={interactiveState}
                onTriggerAction={triggerInteractive}
                bezel={bezel}
              />
            ) : isInteractiveCyber ? (
              <CyberWave
                row={position.row}
                col={position.col}
                totalRows={layout.rows}
                totalCols={layout.cols}
                interactiveState={interactiveState}
                onTriggerAction={triggerInteractive}
                bezel={bezel}
              />
            ) : (
              <CanvasDisplay
                media={media}
                row={position.row}
                col={position.col}
                totalRows={layout.rows}
                totalCols={layout.cols}
                bezel={bezel}
                isPlaying={isPlaying}
                currentTime={currentTime}
              />
            )}
          </div>
        </>
      )}

      {/* ── DEVICE IDENTIFICATION OVERLAY (Requirement 5) ───────────────────── */}
      {isIdentified && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--clay-yellow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4A3A12',
            padding: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <Smartphone size={72} strokeWidth={2.5} style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.85 }}>
            IDENTIFICATION
          </div>
          <h1 style={{ fontSize: 'clamp(2.8rem, 8vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, margin: '8px 0', color: '#4A3A12' }}>
            THIS IS PHONE {slotNumber}
          </h1>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
            Code: {phoneLabel}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '8px', opacity: 0.85 }}>
            Row {position.row + 1}, Column {position.col + 1} • {position.label}
          </div>
        </div>
      )}

      {/* ── SYNCHRONIZED COUNTDOWN OVERLAY (Requirement 9 & 22) ──────────────── */}
      {timerRemaining !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {timerRemaining > 0 ? (
            <>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--clay-yellow)'
                }}
              >
                SYNCHRONIZED COUNTDOWN
              </div>
              <div
                style={{
                  fontSize: 'clamp(6rem, 18vw, 10rem)',
                  fontWeight: 900,
                  lineHeight: 1,
                  margin: '16px 0',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {timerRemaining}
              </div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Synchronizing with all connected screens...
              </div>
            </>
          ) : (
            <div style={{ animation: 'pulseGlow 1s infinite alternate' }}>
              <Sparkles size={64} color="var(--clay-yellow)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#ffffff' }}>
                🎉 CELEBRATE!
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── YOUTUBE-STYLE TAP CONTROLS (Appears on touch, auto-hides) ──────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: showOverlay ? 'auto' : 'none',
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 0.25s ease',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 50
        }}
      >
        {/* Device slot badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              exitDisplayMode();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            <ArrowLeft size={16} /> Exit Display Mode
          </button>

          <div
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="status-dot dot-ready" />
            <span>Slot {slotNumber}: {phoneLabel}</span>
          </div>
        </div>

        {/* Master phone dashboard switch */}
        {isMasterPhone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              exitDisplayMode();
              onNavigate('master', { sessionId });
            }}
            style={{
              background: 'var(--clay-lavender)',
              color: '#271E47',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            <Settings size={16} /> Master Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
