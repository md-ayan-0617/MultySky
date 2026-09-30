import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles, Cake, Flame, Zap } from 'lucide-react';

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
  onVolumeChange,
  onToggleFullscreen
}) {
  const isVideo = media?.type === 'video';
  const isInteractive = media?.type === 'interactive';
  const isCyber = media?.type === 'interactive' && media?.subType === 'cyber';
  const isCake = media?.type === 'interactive' && media?.subType === 'cake';

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
            /* Interactive Actions split by sub-type */
            isCyber ? (
              /* ── Cyber Wave Matrix Controls ─────────────────────────────── */
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Color Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '2px' }}>Color:</span>
                  {[
                    { color: '#00ffff', label: 'Cyan' },
                    { color: '#ff00ff', label: 'Magenta' },
                    { color: '#00ff80', label: 'Neon Green' },
                    { color: '#ff8c00', label: 'Orange' },
                    { color: '#4080ff', label: 'Electric Blue' },
                    { color: '#ffffff', label: 'White' }
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      onClick={() => onTriggerInteractive('CYBER_COLOR', { color })}
                      title={label}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: interactiveState?.waveColor === color
                          ? '3px solid #fff'
                          : '2px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        boxShadow: interactiveState?.waveColor === color
                          ? `0 0 10px ${color}` : 'none',
                        transition: 'all 0.15s',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>

                {/* Wave Speed */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Speed:</span>
                  {[{ v: 0.4, l: '0.4×' }, { v: 1.0, l: '1×' }, { v: 2.0, l: '2×' }, { v: 3.5, l: '3.5×' }].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => onTriggerInteractive('CYBER_SPEED', { speed: v })}
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        background: Math.abs((interactiveState?.waveSpeed ?? 1) - v) < 0.05
                          ? 'rgba(0, 255, 255, 0.2)'
                          : undefined,
                        borderColor: Math.abs((interactiveState?.waveSpeed ?? 1) - v) < 0.05
                          ? 'rgba(0,255,255,0.5)'
                          : undefined,
                        color: Math.abs((interactiveState?.waveSpeed ?? 1) - v) < 0.05
                          ? '#00ffff'
                          : undefined
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Ripple Burst & Glitch */}
                <button
                  onClick={() => onTriggerInteractive('CYBER_RIPPLE', { globalX: 0, globalY: 0, t: Date.now() })}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #00bfff, #6610f2)',
                    boxShadow: '0 4px 15px rgba(0,191,255,0.4)',
                    padding: '8px 16px'
                  }}
                >
                  <Zap size={16} /> Ripple Burst ⚡
                </button>

                <button
                  onClick={() => onTriggerInteractive('CYBER_GLITCH', { active: !interactiveState?.glitchActive })}
                  className="btn-secondary"
                  style={{
                    borderColor: interactiveState?.glitchActive ? 'rgba(255,0,80,0.5)' : undefined,
                    color: interactiveState?.glitchActive ? '#ff4060' : undefined,
                    background: interactiveState?.glitchActive ? 'rgba(255,0,80,0.15)' : undefined
                  }}
                >
                  {interactiveState?.glitchActive ? '🔴 Glitch ON' : '⚫ Glitch OFF'}
                </button>

                <button
                  onClick={() => onTriggerInteractive('CYBER_RESET', {})}
                  className="btn-secondary"
                  style={{ padding: '8px 12px' }}
                  title="Reset cyber wave to defaults"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            ) : (
            /* ── Birthday Cake Controls ─────────────────────────────────── */
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
            )
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
              if (onToggleFullscreen) {
                onToggleFullscreen();
              } else if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(console.warn);
              } else {
                document.exitFullscreen().catch(console.warn);
              }
            }}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Toggle Fullscreen (Master & Display Screens)"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
