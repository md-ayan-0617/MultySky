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
    textSize = 30,
    glowBrightness = 1.2,
    glitchActive = false
  } = interactiveState;

  const colorOptions = [
    { color: '#3B82F6', label: 'Cyber Blue' },
    { color: '#60A5FA', label: 'Sky Glow' },
    { color: '#00F5D4', label: 'Neon Teal' },
    { color: '#A855F7', label: 'Purple Pulse' },
    { color: '#EC4899', label: 'Hot Pink' },
    { color: '#FFFFFF', label: 'Pure White' }
  ];

  return (
    <div className="cyber-controls-card">
      <div className="cyber-controls-header">
        <div className="cyber-header-left">
          <div className="cyber-icon-badge">
            <Sliders size={16} />
          </div>
          <div>
            <h4 className="cyber-controls-title">Cyber Wave Matrix Controls</h4>
            <p className="cyber-controls-sub">Fine-tune wave frequency, glow, and particle intensity</p>
          </div>
        </div>

        <button
          onClick={() => onTriggerInteractive('CYBER_RESET', {})}
          className="cyber-reset-btn"
          title="Reset to default settings"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      <div className="cyber-controls-grid">
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
            <span>Wave Speed: {waveSpeed.toFixed(1)}×</span>
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
            <span>Wave Intensity: {Math.round(waveIntensity * 100)}%</span>
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
            <span>Glow / Brightness: {Math.round(glowBrightness * 100)}%</span>
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

        {/* 5. Interactive Pulse & Glitch Action Buttons */}
        <div className="control-setting-box actions-box">
          <div className="control-setting-label">
            <Zap size={14} />
            <span>Live FX Triggers</span>
          </div>
          <div className="fx-buttons-row">
            <button
              onClick={() => onTriggerInteractive('CYBER_RIPPLE', { globalX: 0, globalY: 0, t: Date.now() })}
              className="btn-primary fx-btn"
            >
              <Zap size={14} /> Ripple Burst ⚡
            </button>

            <button
              onClick={() => onTriggerInteractive('CYBER_GLITCH', { active: !glitchActive })}
              className={`btn-secondary fx-btn ${glitchActive ? 'glitch-active' : ''}`}
            >
              {glitchActive ? '🔴 Glitch ON' : '⚡ Glitch FX'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
