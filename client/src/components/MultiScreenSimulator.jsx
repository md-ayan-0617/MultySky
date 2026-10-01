import React from 'react';
import { Smartphone, Eye, Maximize2, Radio } from 'lucide-react';
import CanvasDisplay from './CanvasDisplay';
import VirtualCake from './VirtualCake';
import CyberWave from './CyberWave';

export default function MultiScreenSimulator({
  layout,
  devices = [],
  media,
  bezel,
  isPlaying,
  currentTime,
  interactiveState,
  onTriggerInteractive,
  onLoadedMetadata
}) {
  const rows = layout?.rows || 2;
  const cols = layout?.cols || 2;
  const totalSlots = rows * cols;

  const isInteractiveCake = media?.type === 'interactive' && media?.subType === 'cake';
  const isInteractiveCyber = media?.type === 'interactive' && media?.subType === 'cyber';

  return (
    <div className="nm-card" style={{ padding: '26px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nm-icon-box" style={{ color: 'var(--accent-emerald)' }}>
            <Eye size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', fontWeight: 700 }}>Live Multi-Screen Wall Preview</h3>
              <span className="badge badge-connected" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                <Radio size={12} className="anim-glow" /> Synchronized
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Real-time visualization of combined smartphone screens and bezel gaps
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--nm-surface-dark)',
          boxShadow: 'var(--nm-inset-sm)',
          border: 'var(--border-card)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: 'var(--accent-cyan)',
          fontWeight: 700
        }}>
          {layout?.name || '2 × 2'} Grid
        </div>
      </div>

      {/* Outer Phone Wall Stage - Neumorphic Deep Inset Well */}
      <div className="nm-well" style={{
        padding: '28px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        boxShadow: 'inset 8px 8px 24px var(--nm-dark-shadow), inset -8px -8px 24px var(--nm-light-shadow)'
      }}>
        {/* Dynamic Grid of Smartphones */}
        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, minmax(140px, 180px))`,
          gridTemplateColumns: `repeat(${cols}, minmax(180px, 240px))`,
          gap: `${Math.max(6, (bezel?.gapX || 3) * 3.5)}px`,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '920px'
        }}>
          {Array.from({ length: totalSlots }).map((_, slotIndex) => {
            const row = Math.floor(slotIndex / cols);
            const col = slotIndex % cols;
            const pairedDevice = devices.find(d => d.position?.index === slotIndex && d.status !== 'disconnected');

            return (
              <div
                key={slotIndex}
                className={`nm-phone-shell ${pairedDevice ? 'active-slot' : ''}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* Phone Speaker & Notch */}
                <div style={{
                  height: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <div style={{ width: '24px', height: '3px', background: '#334155', borderRadius: '3px' }} />
                  <div style={{ width: '4px', height: '4px', background: '#334155', borderRadius: '50%' }} />
                </div>

                {/* Display Screen Area */}
                <div style={{
                  flex: 1,
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#000'
                }}>
                  {isInteractiveCake ? (
                    <VirtualCake
                      row={row}
                      col={col}
                      totalRows={rows}
                      totalCols={cols}
                      interactiveState={interactiveState}
                      onTriggerAction={onTriggerInteractive}
                      bezel={bezel}
                      isSimulator={true}
                    />
                  ) : isInteractiveCyber ? (
                    <CyberWave
                      row={row}
                      col={col}
                      totalRows={rows}
                      totalCols={cols}
                      interactiveState={interactiveState}
                      onTriggerAction={onTriggerInteractive}
                      bezel={bezel}
                      isSimulator={true}
                    />
                  ) : (
                    <CanvasDisplay
                      media={media}
                      row={row}
                      col={col}
                      totalRows={rows}
                      totalCols={cols}
                      bezel={bezel}
                      isPlaying={isPlaying}
                      currentTime={currentTime}
                      onLoadedMetadata={slotIndex === 0 ? onLoadedMetadata : undefined}
                    />
                  )}

                  {/* Slot & Device Overlay Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 10,
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}>
                    <span>Slot {slotIndex + 1}</span>
                    {pairedDevice ? (
                      <span style={{ color: '#22d3ee' }}>• {pairedDevice.name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>• Virtual</span>
                    )}
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div style={{
                  height: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4px'
                }}>
                  <div style={{ width: '32px', height: '2px', background: '#475569', borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
