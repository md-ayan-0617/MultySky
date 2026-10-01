import React from 'react';
import { Cake, Flame, Sparkles, RotateCcw, Clock, Play, Pause } from 'lucide-react';

export default function CakePartyControls({
  onTriggerInteractive,
  timerRemaining,
  timerActive,
  onStartTimer,
  onPauseTimer,
  onResetTimer
}) {
  return (
    <div className="cake-party-card">
      <div className="cake-party-header">
        <div className="cake-header-left">
          <div className="cake-icon-badge">
            <Cake size={18} />
          </div>
          <div>
            <div className="cake-title-row">
              <h4 className="cake-party-title">Virtual Birthday Cake Party</h4>
              <span className="cake-live-tag">✨ Live Interactive Session</span>
            </div>
            <p className="cake-party-sub">Synchronized cake cutting, candle blowing & celebration across displays</p>
          </div>
        </div>
      </div>

      <div className="cake-controls-grid">
        {/* Interactive Cake Action Buttons */}
        <div className="cake-actions-row">
          <button
            onClick={() => onTriggerInteractive('CAKE_CUT', { cutPosition: { x: 0.5, y: 0.5 } })}
            className="cake-action-btn cut-cake"
          >
            <Cake size={18} />
            <span>Cut Birthday Cake! 🎂</span>
          </button>

          <button
            onClick={() => onTriggerInteractive('CANDLE_BLOW')}
            className="cake-action-btn blow-candles"
          >
            <Flame size={16} />
            <span>Blow Candles 🕯️</span>
          </button>

          <button
            onClick={() => onTriggerInteractive('CONFETTI_BURST')}
            className="cake-action-btn confetti"
          >
            <Sparkles size={16} />
            <span>Confetti 🎉</span>
          </button>

          <button
            onClick={() => onTriggerInteractive('RESET_CAKE')}
            className="cake-action-btn reset"
            title="Reset cake back to un-cut"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>

        {/* Synchronized Countdown Timer Widget */}
        <div className="cake-timer-box">
          <div className="timer-header">
            <div className="timer-title-wrap">
              <Clock size={16} className="timer-clock-icon" />
              <div>
                <span className="timer-title">Synchronized Countdown Timer</span>
                <span className="timer-sub">Trigger celebration countdown on all screens</span>
              </div>
            </div>

            {timerRemaining !== null && (
              <span className="timer-countdown-display">
                {timerRemaining}s
              </span>
            )}
          </div>

          <div className="timer-controls-row">
            <div className="timer-presets">
              {[10, 5, 3].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onStartTimer(sec)}
                  className="timer-preset-btn"
                >
                  {sec}s
                </button>
              ))}
            </div>

            <div className="timer-actions">
              {timerActive ? (
                <button onClick={onPauseTimer} className="timer-action-btn pause">
                  <Pause size={14} /> Pause
                </button>
              ) : (
                <button onClick={() => onStartTimer(10)} className="timer-action-btn start">
                  <Play size={14} /> Start 10s
                </button>
              )}
              <button onClick={onResetTimer} className="timer-action-btn reset">
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
