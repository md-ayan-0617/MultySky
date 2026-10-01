import React from 'react';
import { Sliders, RotateCcw, Maximize, Move } from 'lucide-react';

export default function BezelSettings({ bezel = {}, onUpdateBezel }) {
  const gapX = bezel?.gapX ?? 3;
  const gapY = bezel?.gapY ?? 3;
  const scale = bezel?.scale ?? 100;
  const offsetX = bezel?.offsetX ?? 0;
  const offsetY = bezel?.offsetY ?? 0;

  const handleChange = (key, val) => {
    onUpdateBezel({
      ...bezel,
      [key]: val
    });
  };

  const handleReset = () => {
    onUpdateBezel({
      gapX: 3,
      gapY: 3,
      scale: 100,
      offsetX: 0,
      offsetY: 0
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="nm-icon-box" style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            color: 'var(--accent-amber)',
            display: 'flex'
          }}>
            <Sliders size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Bezel & Gap Compensation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Compensate for physical smartphone edge borders for seamless imagery
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          title="Reset to defaults"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Horizontal Gap */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-label)' }}>Horizontal Bezel Gap</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{gapX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={gapX}
            onChange={(e) => handleChange('gapX', parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Vertical Gap */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-label)' }}>Vertical Bezel Gap</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{gapY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={gapY}
            onChange={(e) => handleChange('gapY', parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Scale / Zoom */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-label)' }}>Media Zoom / Scale</span>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{scale}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="130"
            step="1"
            value={scale}
            onChange={(e) => handleChange('scale', parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Crop Offset Shift X */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-label)' }}>Horizontal Offset (X)</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{offsetX}px</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetX}
            onChange={(e) => handleChange('offsetX', parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Crop Offset Shift Y */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-label)' }}>Vertical Offset (Y)</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{offsetY}px</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetY}
            onChange={(e) => handleChange('offsetY', parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
