import React from 'react';
import { Sliders, Zap, Sun, Palette, Activity, RotateCcw } from 'lucide-react';

export default function CyberWaveControls({
  interactiveState = {},
  onTriggerInteractive
}) {
  const {
    waveColor = '#3B82F6',
    waveSpeed = 1.0,
    waveIntensity = 1.0,
    glowBrightness = 1.2,
    glitchActive = false
  } = interactiveState;

  const colorOptions = [
    { color: '#3B82F6', label: 'Blue' },
    { color: '#60A5FA', label: 'Sky' },
    { color: '#00F5D4', label: 'Teal' },
    { color: '#A855F7', label: 'Purple' },
    { color: '#EC4899', label: 'Pink' },
    { color: '#FFFFFF', label: 'White' }
  ];

  return (
    <div className="cyber-controls-card">
      <div className="cyber-controls-header">
        <div className="cyber-header-left">
          <div className="cyber-icon-badge">
            <Sliders size={16} />
          </div>
          <h4 className="cyber-controls-title">Cyber Wave Controls</h4>
        </div>

        <button
          onClick={() => {
            onTriggerInteractive('CYBER_RESET', {});
            onTriggerInteractive('CUSTOM_TEXT', { text: '' });
          }}
          className="cyber-reset-btn"
          title="Reset"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      <div className="cyber-controls-grid">
        {/* Optional Typing Text Input (Requirement 3) */}
        <div className="control-setting-box" style={{ gridColumn: '1 / -1' }}>
          <div className="control-setting-label">
            <span>Matrix Text (Optional)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              maxLength={40}
              placeholder="Leave empty or enter text for typing animation..."
              value={interactiveState?.customText || ''}
              onChange={(e) => onTriggerInteractive('CUSTOM_TEXT', { text: e.target.value })}
              className="admin-input"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
            {interactiveState?.customText ? (
              <button
                type="button"
                onClick={() => onTriggerInteractive('CUSTOM_TEXT', { text: '' })}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                title="Clear text"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* 1. Color Palette Presets */}
        <div className="control-setting-box">
          <div className="control-setting-label">
            <Palette size={14} />
            <span>Matrix Color</span>
          </div>
          <div className="color-swatches-wrap">
            {colorOptions.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => onTriggerInteractive('CYBER_COLOR', { color })}
                title={label}
                className={`color-swatch-btn ${waveColor === color ? 'active-swatch' : ''}`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        {/* 2. Wave Speed Segmented */}
        <div className="control-setting-box">
          <div className="control-setting-label">
            <Zap size={14} />
            <span>Speed: {waveSpeed.toFixed(1)}×</span>
          </div>
          <div className="segmented-pill-row">
            {[0.5, 1.0, 2.0, 3.5].map((spd) => (
              <button
                key={spd}
                onClick={() => onTriggerInteractive('CYBER_SPEED', { speed: spd })}
                className={`pill-btn ${Math.abs(waveSpeed - spd) < 0.1 ? 'active' : ''}`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        {/* 3. Wave Intensity */}
        <div className="control-setting-box">
          <div className="control-setting-label">
            <Activity size={14} />
            <span>Intensity: {Math.round(waveIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.0"
            step="0.1"
            value={waveIntensity}
            onChange={(e) => onTriggerInteractive('CYBER_INTENSITY', { intensity: parseFloat(e.target.value) })}
            className="cyber-slider"
          />
        </div>

        {/* 4. Glow & Brightness */}
        <div className="control-setting-box">
          <div className="control-setting-label">
            <Sun size={14} />
            <span>Glow: {Math.round(glowBrightness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={glowBrightness}
            onChange={(e) => onTriggerInteractive('CYBER_GLOW', { glow: parseFloat(e.target.value) })}
            className="cyber-slider"
          />
        </div>

        {/* 5. Glitch Toggle (without ripple pulse) */}
        <div className="control-setting-box">
          <div className="control-setting-label">
            <Zap size={14} />
            <span>FX</span>
          </div>
          <button
            onClick={() => onTriggerInteractive('CYBER_GLITCH', { active: !glitchActive })}
            className={`btn-secondary fx-btn ${glitchActive ? 'glitch-active' : ''}`}
            style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
          >
            {glitchActive ? 'Glitch ON' : 'Glitch FX'}
          </button>
        </div>
      </div>
    </div>
  );
}
