import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles, Cake, Flame } from 'lucide-react';

export default function PlaybackControls({
  isPlaying,
  currentTime = 0,
  duration = 0,
  onPlay,
  onPause,
  onSeek,
  onRestart,
  media,
  onTriggerInteractive,
  interactiveState,
  isMuted,
  onToggleMute,
  volume = 1,
  onVolumeChange
}) {
  const isVideo = media?.type === 'video';
  const isInteractive = media?.type === 'interactive';

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px 24px' }}>
      {/* Title / Media Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Media:
          </span>
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
            {media?.name || 'No Media Selected'}
          </span>
        </div>

        {isInteractive && (
          <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }}>
            ✨ Live Interactive Session
          </span>
        )}
      </div>

      {/* Video Progress Scrubber */}
      {isVideo && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '40px' }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#6366f1',
                cursor: 'pointer',
                height: '6px',
                borderRadius: '4px'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '40px' }}>
              {formatTime(duration || 100)}
            </span>
          </div>
        </div>
      )}

      {/* Main Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Left: Playback buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isVideo ? (
            <>
              {isPlaying ? (
                <button onClick={onPause} className="btn-primary" style={{ padding: '10px 20px' }}>
                  <Pause size={18} /> Pause All
                </button>
              ) : (
                <button onClick={onPlay} className="btn-primary" style={{ padding: '10px 20px' }}>
                  <Play size={18} /> Play All
                </button>
              )}

              <button onClick={onRestart} className="btn-secondary" title="Restart to beginning">
                <RotateCcw size={16} /> Restart
              </button>
            </>
          ) : isInteractive ? (
            /* Interactive Actions for Virtual Cake Party! */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onTriggerInteractive('CAKE_CUT', { cutPosition: { x: 0.5, y: 0.5 } })}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                }}
              >
                <Cake size={18} /> Cut Birthday Cake! 🎂
              </button>

              <button
                onClick={() => onTriggerInteractive('CANDLE_BLOW')}
                className="btn-secondary"
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
              >
                <Flame size={16} /> Blow Candles 🕯️
              </button>

              <button
                onClick={() => onTriggerInteractive('CONFETTI_BURST')}
                className="btn-secondary"
              >
                <Sparkles size={16} color="#a855f7" /> Confetti 🎉
              </button>

              <button
                onClick={() => onTriggerInteractive('RESET_CAKE')}
                className="btn-secondary"
                style={{ padding: '8px 12px' }}
                title="Reset cake back to un-cut"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Static media active across all connected display phones.
            </div>
          )}
        </div>

        {/* Right: Audio Volume & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isVideo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onToggleMute}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                {isMuted ? <VolumeX size={18} color="#f87171" /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                style={{ width: '80px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>
          )}

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(console.warn);
              } else {
                document.exitFullscreen().catch(console.warn);
              }
            }}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Toggle Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
