import React from 'react';
import { Grid, Layers, Monitor } from 'lucide-react';

const LAYOUT_OPTIONS = [
  { id: '1x1', name: '1 × 1', rows: 1, cols: 1, label: 'Single Screen', desc: '1 Device' },
  { id: '1x2', name: '1 × 2', rows: 1, cols: 2, label: 'Dual Horizontal', desc: '2 Devices' },
  { id: '2x1', name: '2 × 1', rows: 2, cols: 1, label: 'Dual Vertical', desc: '2 Devices' },
  { id: '2x2', name: '2 × 2', rows: 2, cols: 2, label: 'Quad Grid', desc: '4 Devices' },
  { id: '2x3', name: '2 × 3', rows: 2, cols: 3, label: 'Wide Cinema', desc: '6 Devices' },
  { id: '3x3', name: '3 × 3', rows: 3, cols: 3, label: 'Mega Wall', desc: '9 Devices' }
];

export default function LayoutSelector({ currentLayout, onSelectLayout }) {
  const activeId = currentLayout?.id || '2x2';

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            padding: '8px',
            borderRadius: '10px',
            color: '#a5b4fc',
            display: 'flex'
          }}>
            <Grid size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Screen Layout Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select how many smartphones will combine to form your display
            </p>
          </div>
        </div>

        <span className="badge badge-ready">
          {currentLayout?.rows || 2} × {currentLayout?.cols || 2} Grid ({currentLayout?.total || 4} Screens)
        </span>
      </div>

      {/* Grid of Layout Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {LAYOUT_OPTIONS.map((item) => {
          const isSelected = activeId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectLayout(item.id)}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {/* Visual Mini Layout Grid */}
              <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${item.rows}, 1fr)`,
                gridTemplateColumns: `repeat(${item.cols}, 1fr)`,
                gap: '3px',
                width: '64px',
                height: '48px',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px',
                borderRadius: '6px',
                marginBottom: '10px'
              }}>
                {Array.from({ length: item.rows * item.cols }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#fff' : '#cbd5e1' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: isSelected ? '#a5b4fc' : 'var(--text-dim)', marginTop: '2px' }}>
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
