import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Info, ArrowLeft, Radio, Smartphone, AlertCircle } from 'lucide-react';
import CanvasDisplay from '../components/CanvasDisplay';
import VirtualCake from '../components/VirtualCake';
import PositionGuideModal from '../components/PositionGuideModal';
import { useSession } from '../hooks/useSession';
import { usePlaybackSync } from '../hooks/usePlaybackSync';

export default function DisplayScreen({ sessionId, deviceId, deviceName, onNavigate }) {
  const [showPositionGuide, setShowPositionGuide] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // Hook for session & socket
  const { session, device, isConnected, clockOffset } = useSession({
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  };

  // Auto-hide controls overlay after 4 seconds of inactivity
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

  const isInteractiveCake = media?.type === 'interactive' && media?.subType === 'cake';

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

  return (
    <div
      onClick={() => setShowOverlay(prev => !prev)}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Position Assignment Guide Modal (On Initial Join) */}
      <PositionGuideModal
        isOpen={showPositionGuide}
        onConfirm={() => {
          setShowPositionGuide(false);
          // Try entering fullscreen on confirmation tap
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
        layout={layout}
        devicePosition={position}
        deviceName={deviceName}
      />

      {/* Main Cropped Content Area */}
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
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        zIndex: 50
      }}>
        {/* Device slot badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}
            style={{
              background: 'rgba(0,0,0,0.5)',
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
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="status-dot dot-ready" />
            <span>Slot {(position.index ?? 0) + 1}: {position.label}</span>
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
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
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
