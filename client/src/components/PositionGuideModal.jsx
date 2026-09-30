import React from 'react';
import { Smartphone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function PositionGuideModal({
  isOpen,
  onConfirm,
  layout,
  devicePosition,
  deviceName
}) {
  if (!isOpen) return null;

  const rows = layout?.rows || 2;
  const cols = layout?.cols || 2;
  const targetIndex = devicePosition?.index ?? 0;
  const positionLabel = devicePosition?.label || 'Assigned Screen';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 15, 0.96)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(15, 18, 30, 0.85)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(99, 102, 241, 0.25)',
        animation: 'glowPulse 3s infinite'
      }}>
        {/* Header badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '14px'
        }}>
          <CheckCircle size={16} /> Device Paired Successfully
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Your Phone Position
        </h2>

        <div style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#38bdf8',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px'
        }}>
          {positionLabel}
        </div>

        {/* Visual Phone Wall Grid with Pulsing Highlight on Assigned Slot */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '24px',
          display: 'inline-block',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, 70px)`,
            gridTemplateColumns: `repeat(${cols}, 85px)`,
            gap: '8px'
          }}>
            {Array.from({ length: rows * cols }).map((_, slotIdx) => {
              const isMySlot = slotIdx === targetIndex;
              return (
                <div
                  key={slotIdx}
                  style={{
                    background: isMySlot
                      ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isMySlot ? '2px solid #ffffff' : '1px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isMySlot ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                    boxShadow: isMySlot ? '0 0 25px rgba(16, 185, 129, 0.8)' : 'none',
                    transform: isMySlot ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative'
                  }}
                >
                  <Smartphone size={18} style={{ marginBottom: '2px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                    {slotIdx + 1}
                  </span>
                  {isMySlot && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      background: '#10b981',
                      color: '#000',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
                    }}>
                      YOU
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginBottom: '24px',
          lineHeight: 1.5
        }}>
          Place this smartphone at position <strong>{positionLabel}</strong> next to the other phones to form one continuous big screen display.
        </p>

        {/* Confirmation Button */}
        <button
          onClick={onConfirm}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          Position Confirmed & Start Display <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
