import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ArrowRight, ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft, ArrowUp, ArrowDown, ArrowLeft, Sparkles, Check } from 'lucide-react';

export default function PositionGuideModal({
  isOpen,
  onConfirm,
  layout,
  devicePosition,
  deviceName
}) {
  const [isConfirmedStep, setIsConfirmedStep] = useState(false);

  if (!isOpen) return null;

  const rows = layout?.rows || 2;
  const cols = layout?.cols || 2;
  const targetIndex = devicePosition?.index ?? 0;
  const row = devicePosition?.row ?? 0;
  const col = devicePosition?.col ?? 0;
  const positionLabel = devicePosition?.label || 'Assigned Screen';

  // Determine directional arrow for the phone position
  const getDirectionArrow = () => {
    if (rows === 1 && cols === 2) {
      return col === 0 ? <ArrowLeft size={36} color="#00e5ff" /> : <ArrowRight size={36} color="#00e5ff" />;
    }
    if (rows === 2 && cols === 1) {
      return row === 0 ? <ArrowUp size={36} color="#00e5ff" /> : <ArrowDown size={36} color="#00e5ff" />;
    }
    if (row === 0 && col === 0) return <ArrowUpLeft size={40} color="#00e5ff" />;
    if (row === 0 && col === cols - 1) return <ArrowUpRight size={40} color="#00e5ff" />;
    if (row === rows - 1 && col === 0) return <ArrowDownLeft size={40} color="#00e5ff" />;
    if (row === rows - 1 && col === cols - 1) return <ArrowDownRight size={40} color="#00e5ff" />;
    if (row === 0) return <ArrowUp size={40} color="#00e5ff" />;
    if (row === rows - 1) return <ArrowDown size={40} color="#00e5ff" />;
    if (col === 0) return <ArrowLeft size={40} color="#00e5ff" />;
    return <ArrowRight size={40} color="#00e5ff" />;
  };

  const handleStartDisplay = () => {
    setIsConfirmedStep(true);
    setTimeout(() => {
      onConfirm();
    }, 1200);
  };

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
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.4)',
        borderRadius: '24px',
        padding: '28px 20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0, 229, 255, 0.25)',
        animation: 'glowPulse 3s infinite'
      }}>
        
        {/* ── 4 Step Indicator (PRD Page 11) ───────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>✓</div>
            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>1. Scanned</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isConfirmedStep ? '#10b981' : '#00e5ff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>2</div>
            <span style={{ fontSize: '0.65rem', color: '#00e5ff', fontWeight: 700 }}>2. Position</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isConfirmedStep ? '#10b981' : 'rgba(255,255,255,0.1)', color: isConfirmedStep ? '#000' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>3</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>3. Place Phone</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isConfirmedStep ? '#10b981' : 'rgba(255,255,255,0.1)', color: isConfirmedStep ? '#000' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>4</div>
            <span style={{ fontSize: '0.65rem', color: isConfirmedStep ? '#10b981' : 'var(--text-dim)', fontWeight: 600 }}>4. Start</span>
          </div>
        </div>

        {/* ── STEP 4: Position Confirmed Animation (PRD Page 11 Mockup) ── */}
        {isConfirmedStep ? (
          <div style={{ padding: '30px 10px', animation: 'scaleUp 0.3s ease-out' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)',
              color: '#fff'
            }}>
              <CheckCircle2 size={46} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Position Confirmed!
            </h2>

            <p style={{ color: '#6ee7b7', fontSize: '1rem', fontWeight: 500 }}>
              Enjoy the big screen experience.
            </p>
          </div>
        ) : (
          /* ── STEP 2 & 3: Visual Position Animation (PRD Page 11) ──────── */
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Position:
            </span>

            <div style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#00e5ff',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginTop: '4px',
              marginBottom: '16px',
              textShadow: '0 0 15px rgba(0,229,255,0.5)'
            }}>
              {positionLabel}
            </div>

            {/* Directional Phone Arrow Animation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                padding: '10px 14px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'bounceSlow 2s infinite'
              }}>
                {getDirectionArrow()}
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Place phone at <strong>{positionLabel}</strong>
                </span>
              </div>
            </div>

            {/* Visual Phone Wall Grid with Pulsing Highlight on Assigned Slot */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '20px',
              display: 'inline-block',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${rows}, 65px)`,
                gridTemplateColumns: `repeat(${cols}, 80px)`,
                gap: '8px'
              }}>
                {Array.from({ length: rows * cols }).map((_, slotIdx) => {
                  const isMySlot = slotIdx === targetIndex;
                  return (
                    <div
                      key={slotIdx}
                      style={{
                        background: isMySlot
                          ? 'linear-gradient(135deg, #00e5ff 0%, #06b6d4 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isMySlot ? '2px solid #ffffff' : '1px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isMySlot ? '#000' : 'rgba(255, 255, 255, 0.4)',
                        boxShadow: isMySlot ? '0 0 25px rgba(0, 229, 255, 0.85)' : 'none',
                        transform: isMySlot ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        position: 'relative'
                      }}
                    >
                      <Smartphone size={18} style={{ marginBottom: '2px' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>
                        {slotIdx + 1}
                      </span>
                      {isMySlot && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          background: '#00e5ff',
                          color: '#000',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction description */}
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              lineHeight: 1.5
            }}>
              Align this smartphone at <strong>{positionLabel}</strong> next to the other connected phones to form the continuous virtual display.
            </p>

            {/* Confirmation Button (PRD Page 11 Step 4) */}
            <button
              onClick={handleStartDisplay}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)',
                color: '#000',
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(0, 229, 255, 0.4)'
              }}
            >
              Position Confirmed & Display Start <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
