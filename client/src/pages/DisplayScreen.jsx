import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Info, ArrowLeft, Radio, Smartphone, AlertCircle, Sparkles, Check, Clock, ShieldAlert } from 'lucide-react';
import CanvasDisplay from '../components/CanvasDisplay';
import VirtualCake from '../components/VirtualCake';
import CyberWave from '../components/CyberWave';
import PositionGuideModal from '../components/PositionGuideModal';
import { useSession } from '../hooks/useSession';
import { usePlaybackSync } from '../hooks/usePlaybackSync';

export default function DisplayScreen({ sessionId, deviceId, deviceName, onNavigate }) {
  const [showPositionGuide, setShowPositionGuide] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
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
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
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
  }, []);

  // ── Fullscreen API Handling ────────────────────────────────────────────────
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const enterDisplayMode = () => {
    requestWakeLock();
    setShowPositionGuide(false);
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
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    }
    setShowOverlay(true);
  };

  // ── Master Fullscreen Request Broadcast ────────────────────────────────────
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
      if (data?.deviceId === deviceId) {
        setIsIdentified(true);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        setTimeout(() => setIsIdentified(false), 4500);
      }
    };
    socket.on('device-identify', handleIdentify);
    return () => socket.off('device-identify', handleIdentify);
  }, [socket, deviceId]);

  // ── Join Media Animation (Requirement 6) ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setJoinAnimationActive(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // ── Synchronized Countdown Timer (Requirement 9) ───────────────────────────
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

  // Auto-hide controls overlay after 4 seconds
  useEffect(() => {
    if (!showOverlay) return;
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [showOverlay]);

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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090a10',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '400px' }}>
          <AlertCircle size={48} color="#f43f5e" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Session Ended</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
            The master controller has closed this multi-screen session.
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c101a',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '420px', width: '100%' }}>
          <ShieldAlert size={48} color="var(--accent-amber)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.4rem' }}>Waiting for Host Approval</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
            Your phone <strong>{device?.name || deviceName}</strong> ({phoneLabel}) is connected. Please wait for the host to approve your device into the wall.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '20px', color: 'var(--accent-amber)', fontSize: '0.85rem' }}>
            <span className="status-dot dot-pending" /> Approval Pending...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setShowOverlay(prev => !prev)}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: session?.blackout ? '#000000' : '#000',
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
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.4s ease'
            }}>
              <img
                src={session.joinMedia.url}
                alt="Join Media"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={{
                position: 'absolute',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--accent-primary)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Connected to MultiScreen</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  Assigned Slot {slotNumber} ({phoneLabel})
                </div>
              </div>
            </div>
          )}

          {/* Position Assignment Guide Modal (On Initial Join) */}
          <PositionGuideModal
            isOpen={showPositionGuide}
            onConfirm={() => {
              enterDisplayMode();
            }}
            layout={layout}
            devicePosition={position}
            deviceName={deviceName}
          />

          {/* Main Display Area */}
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
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(6, 182, 212, 0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          padding: '24px',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Smartphone size={72} strokeWidth={2.5} style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.85 }}>
            IDENTIFICATION
          </div>
          <h1 style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, margin: '8px 0', color: '#000000' }}>
            THIS IS PHONE {slotNumber}
          </h1>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
            Code: {phoneLabel}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '8px', opacity: 0.85 }}>
            Row {position.row + 1}, Column {position.col + 1} • {position.label}
          </div>
        </div>
      )}

      {/* ── SYNCHRONIZED COUNTDOWN OVERLAY (Requirement 9) ──────────────────── */}
      {timerRemaining !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          {timerRemaining > 0 ? (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>
                SYNCHRONIZED COUNTDOWN
              </div>
              <div style={{ fontSize: '8rem', fontWeight: 900, lineHeight: 1, margin: '16px 0', textShadow: '0 0 40px rgba(99, 102, 241, 0.8)' }}>
                {timerRemaining}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                Synchronizing with all connected screens...
              </div>
            </>
          ) : (
            <div style={{ animation: 'pulseGlow 1s infinite alternate' }}>
              <Sparkles size={64} color="var(--accent-amber)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#ffffff' }}>🎉 CELEBRATE!</div>
            </div>
          )}
        </div>
      )}

      {/* ── PROMINENT "ENTER DISPLAY MODE" FLOATING BAR (Requirement 7) ────── */}
      {!isFullscreen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); enterDisplayMode(); }}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Maximize2 size={18} /> ENTER DISPLAY MODE
          </button>
        </div>
      )}

      {/* Floating Minimal Controls (Visible on tap, auto-hides) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: showOverlay ? 'auto' : 'none',
        opacity: showOverlay ? 1 : 0,
        transition: 'opacity 0.3s ease',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
        zIndex: 50
      }}>
        {/* Device slot badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>

          <div style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="status-dot dot-ready" />
            <span>Slot {slotNumber}: {phoneLabel}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowPositionGuide(true); }}
            title="Show position guide"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <Info size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFullscreen) {
                exitDisplayMode();
              } else {
                enterDisplayMode();
              }
            }}
            title={isFullscreen ? 'Exit Display Mode' : 'Enter Display Mode'}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
