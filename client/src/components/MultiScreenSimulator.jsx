import React, { useState } from 'react';
import { Smartphone, Eye, Radio, Sparkles, Check, Wifi, AlertCircle, Grid } from 'lucide-react';
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
  onLoadedMetadata,
  selectedDeviceId,
  onSelectDevice,
  identifiedDeviceId,
  onIdentifyDevice
}) {
  const rows = layout?.rows || 2;
  const cols = layout?.cols || 2;
  const totalSlots = Math.min(100, Math.max(1, layout?.total || (rows * cols)));

  // If grid is larger than 9 devices, use lightweight status grid by default for maximum performance
  const isLargeGrid = totalSlots > 9;
  const [viewMode, setViewMode] = useState(isLargeGrid ? 'grid' : 'media');

  const isInteractiveCake = media?.type === 'interactive' && media?.subType === 'cake';
  const isInteractiveCyber = media?.type === 'interactive' && media?.subType === 'cyber';

  const connectedCount = devices.filter(d => d.status === 'ready').length;

  return (
    <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nm-icon-box" style={{ width: '38px', height: '38px', color: 'var(--accent-emerald)', background: 'var(--nm-surface-light)' }}>
            <Eye size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', fontWeight: 700 }}>
                Live Grid Wall ({rows}×{cols})
              </h3>
              <span className="badge badge-ready" style={{ fontSize: '0.72rem' }}>
                <Radio size={12} /> {connectedCount} / {totalSlots} Online
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time multi-device tile map and screen assignment
            </p>
          </div>
        </div>

        {/* View Switcher (Media vs Lightweight Status Grid) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--nm-surface-dark)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: viewMode === 'grid' ? 'var(--btn-primary-bg)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Tile Map ({totalSlots})
          </button>
          {!isLargeGrid && (
            <button
              onClick={() => setViewMode('media')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: viewMode === 'media' ? 'var(--btn-primary-bg)' : 'transparent',
                color: viewMode === 'media' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Media Preview
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div style={{
        background: 'var(--nm-surface-dark)',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-subtle)',
        padding: totalSlots > 36 ? '12px' : '20px',
        minHeight: '340px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'auto'
      }}>
        {/* ── 1. LIGHTWEIGHT 100-PHONE STATUS GRID (Essential info: P01, ● Connected) ── */}
        {(viewMode === 'grid' || isLargeGrid) ? (
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: totalSlots > 36 ? '4px' : '8px',
            width: '100%',
            maxWidth: totalSlots > 40 ? '100%' : '840px',
            aspectRatio: `${cols} / ${rows}`,
            maxHeight: '600px'
          }}>
            {Array.from({ length: totalSlots }).map((_, slotIndex) => {
              const row = Math.floor(slotIndex / cols);
              const col = slotIndex % cols;
              const pairedDevice = devices.find(d => d.position?.index === slotIndex && d.status !== 'disconnected');
              const isSelected = pairedDevice && selectedDeviceId === pairedDevice.id;
              const isIdentified = pairedDevice && identifiedDeviceId === pairedDevice.id;
              const slotCode = `P${String(slotIndex + 1).padStart(2, '0')}`;

              return (
                <div
                  key={slotIndex}
                  onClick={() => {
                    if (pairedDevice && onSelectDevice) onSelectDevice(pairedDevice);
                  }}
                  className={`nm-phone-shell ${pairedDevice ? 'active-slot' : ''} ${isIdentified ? 'identified-slot' : ''}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: totalSlots > 40 ? '2px' : '6px',
                    borderRadius: totalSlots > 50 ? '4px' : '8px',
                    cursor: pairedDevice ? 'pointer' : 'default',
                    background: pairedDevice
                      ? (isSelected ? 'rgba(99, 102, 241, 0.25)' : 'var(--nm-surface)')
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isIdentified
                      ? '2px solid var(--accent-cyan)'
                      : (isSelected ? '2px solid var(--accent-primary)' : (pairedDevice ? '1px solid rgba(16, 185, 129, 0.3)' : '1px dashed rgba(255, 255, 255, 0.08)')),
                    transition: 'all 0.15s ease'
                  }}
                  title={pairedDevice ? `${pairedDevice.name} (${pairedDevice.deviceCode || slotCode}) - Status: ${pairedDevice.status}` : `Slot ${slotIndex + 1}: Empty`}
                >
                  {/* Slot Identifier */}
                  <div style={{
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    fontSize: totalSlots > 50 ? '0.62rem' : (totalSlots > 25 ? '0.72rem' : '0.85rem'),
                    color: pairedDevice ? 'var(--text-heading)' : 'var(--text-dim)',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {pairedDevice?.deviceCode || slotCode}
                  </div>

                  {/* Master phone indicator */}
                  {pairedDevice?.isMaster && totalSlots <= 40 && (
                    <span style={{
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      background: 'var(--clay-lavender)',
                      color: '#271E47',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      textTransform: 'uppercase'
                    }}>
                      MASTER
                    </span>
                  )}

                  {/* Status Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: totalSlots > 50 ? '2px' : '4px'
                  }}>
                    <span
                      className={`status-dot ${pairedDevice ? (pairedDevice.status === 'pending' ? 'dot-pending' : 'dot-ready') : 'dot-disconnected'}`}
                      style={{ width: totalSlots > 50 ? '5px' : '7px', height: totalSlots > 50 ? '5px' : '7px' }}
                    />
                    {totalSlots <= 36 && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: pairedDevice ? (pairedDevice.status === 'pending' ? '#B45309' : '#15803D') : 'var(--text-dim)',
                        whiteSpace: 'nowrap'
                      }}>
                        {pairedDevice ? (pairedDevice.status === 'pending' ? 'Pending' : (pairedDevice.isMaster ? 'Master Display' : 'Connected')) : 'Empty'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── 2. DETAILED MEDIA PREVIEW (For 1-9 screens) ── */
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, minmax(130px, 170px))`,
            gridTemplateColumns: `repeat(${cols}, minmax(160px, 220px))`,
            gap: `${Math.max(4, (bezel?.gapX || 3) * 2)}px`,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {Array.from({ length: totalSlots }).map((_, slotIndex) => {
              const row = Math.floor(slotIndex / cols);
              const col = slotIndex % cols;
              const pairedDevice = devices.find(d => d.position?.index === slotIndex && d.status !== 'disconnected');
              const isSelected = pairedDevice && selectedDeviceId === pairedDevice.id;

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
                    overflow: 'hidden',
                    border: isSelected ? '2px solid var(--accent-primary)' : 'var(--border-card)'
                  }}
                >
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
                    {isInteractiveCake ? (
                      <VirtualCake
                        row={row}
                        col={col}
                        totalRows={rows}
                        totalCols={cols}
                        interactiveState={interactiveState}
                        onTriggerAction={onTriggerInteractive}
                        bezel={bezel}
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
                        onLoadedMetadata={onLoadedMetadata}
                      />
                    )}

                    {/* Slot Overlay Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span className={`status-dot ${pairedDevice ? 'dot-ready' : 'dot-disconnected'}`} />
                      <span>P{String(slotIndex + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
