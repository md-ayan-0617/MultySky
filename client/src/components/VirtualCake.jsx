import React, { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function VirtualCake({
  row = 0,
  col = 0,
  totalRows = 2,
  totalCols = 2,
  interactiveState = {},
  onTriggerAction,
  bezel = {},
  isSimulator = false
}) {
  const containerRef = useRef(null);
  const [touchTrail, setTouchTrail] = useState([]);
  const [isCutting, setIsCutting] = useState(false);

  const { cakeCut = false, candlesBlown = false } = interactiveState;

  // Sound effect via Web Audio API
  const playCelebrateSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // C5, D5, E5, G5, A5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.1);
        osc.stop(audioCtx.currentTime + idx * 0.1 + 0.4);
      });
    } catch (e) {
      console.warn('Audio not allowed yet without user gesture', e);
    }
  };

  // Confetti trigger
  useEffect(() => {
    if (cakeCut) {
      playCelebrateSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cakeCut]);

  // Touch / Drag cutting gesture
  const handlePointerDown = (e) => {
    setIsCutting(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTouchTrail([{ x, y }]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isCutting) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTouchTrail(prev => [...prev.slice(-10), { x, y }]);
    }
  };

  const handlePointerUp = () => {
    if (isCutting && touchTrail.length > 2) {
      if (onTriggerAction && !cakeCut) {
        onTriggerAction('CAKE_CUT', { cutPosition: touchTrail[touchTrail.length - 1] });
      }
    }
    setIsCutting(false);
    setTouchTrail([]);
  };

  // Bezel gap factors
  const gapX = (bezel?.gapX || 0) / 100;
  const gapY = (bezel?.gapY || 0) / 100;
  const scale = (bezel?.scale || 100) / 100;

  // Virtual cake total coordinate space
  // We offset this container so that only the (row, col) cell is visible
  const leftPct = -(col * (100 + gapX * 100));
  const topPct = -(row * (100 + gapY * 100));
  const widthPct = (totalCols * 100) * scale;
  const heightPct = (totalRows * 100) * scale;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#120a1c',
        touchAction: 'none',
        userSelect: 'none',
        cursor: cakeCut ? 'default' : 'crosshair'
      }}
    >
      {/* Whole Virtual Cake Canvas translated to current phone's slice */}
      <div style={{
        position: 'absolute',
        top: `${topPct}%`,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #2e1045 0%, #0d0417 80%)',
        transition: 'transform 0.5s ease'
      }}>
        {/* The Master Cake Object */}
        <div style={{
          position: 'relative',
          width: '70vmin',
          height: '70vmin',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Cake Plate */}
          <div style={{
            position: 'absolute',
            width: '85vmin',
            height: '85vmin',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f8fafc 40%, #cbd5e1 80%, #94a3b8 100%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(236, 72, 153, 0.3)',
            zIndex: 1
          }} />

          {/* Cake Main Body (Splits into 2 halves when cakeCut is true!) */}
          <div style={{
            position: 'relative',
            width: '70vmin',
            height: '70vmin',
            borderRadius: '50%',
            zIndex: 2,
            display: 'flex',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Left Half */}
            <div style={{
              width: '50%',
              height: '100%',
              borderTopLeftRadius: '35vmin',
              borderBottomLeftRadius: '35vmin',
              background: 'radial-gradient(circle at 80% 50%, #f472b6 0%, #db2777 60%, #be185d 100%)',
              borderRight: cakeCut ? '4px solid #fdf2f8' : 'none',
              transform: cakeCut ? 'translateX(-4vmin) rotate(-3deg)' : 'translateX(0)',
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Frosting drips */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 70%, transparent 100%)',
                opacity: 0.9
              }} />
              {/* Strawberries & sprinkles */}
              <div style={{ position: 'absolute', top: '25%', left: '30%', fontSize: '4vmin' }}>🍓</div>
              <div style={{ position: 'absolute', top: '60%', left: '40%', fontSize: '3.5vmin' }}>🍒</div>
              <div style={{ position: 'absolute', top: '40%', left: '60%', fontSize: '3vmin' }}>⭐</div>
            </div>

            {/* Right Half */}
            <div style={{
              width: '50%',
              height: '100%',
              borderTopRightRadius: '35vmin',
              borderBottomRightRadius: '35vmin',
              background: 'radial-gradient(circle at 20% 50%, #f472b6 0%, #db2777 60%, #be185d 100%)',
              borderLeft: cakeCut ? '4px solid #fdf2f8' : 'none',
              transform: cakeCut ? 'translateX(4vmin) rotate(3deg)' : 'translateX(0)',
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Frosting drips */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 70%, transparent 100%)',
                opacity: 0.9
              }} />
              {/* Strawberries & sprinkles */}
              <div style={{ position: 'absolute', top: '30%', right: '35%', fontSize: '4vmin' }}>🍓</div>
              <div style={{ position: 'absolute', top: '65%', right: '45%', fontSize: '3.5vmin' }}>🍒</div>
              <div style={{ position: 'absolute', top: '45%', right: '60%', fontSize: '3vmin' }}>⭐</div>
            </div>

            {/* Candles Cluster in the center */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: '2.5vmin',
              zIndex: 10
            }}>
              {[0, 1, 2, 3].map(cIdx => (
                <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Flame */}
                  {!candlesBlown ? (
                    <div style={{
                      width: '2vmin',
                      height: '3vmin',
                      background: 'radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fde047 40%, #f97316 75%, #ef4444 100%)',
                      borderRadius: '50% 50% 35% 35%',
                      boxShadow: '0 0 15px #f59e0b, 0 0 30px #f97316',
                      animation: `glowPulse ${1 + cIdx * 0.3}s infinite alternate`
                    }} />
                  ) : (
                    <div style={{
                      width: '1vmin',
                      height: '2vmin',
                      background: 'rgba(255,255,255,0.4)',
                      borderRadius: '50%',
                      filter: 'blur(2px)',
                      animation: 'float 2s ease-out forwards'
                    }}>
                      💨
                    </div>
                  )}
                  {/* Candle Stick */}
                  <div style={{
                    width: '1.4vmin',
                    height: '6vmin',
                    background: cIdx % 2 === 0
                      ? 'repeating-linear-gradient(45deg, #38bdf8, #38bdf8 4px, #ffffff 4px, #ffffff 8px)'
                      : 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 4px, #ffffff 4px, #ffffff 8px)',
                    borderRadius: '2px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }} />
                </div>
              ))}
            </div>

            {/* Happy Birthday Message on Cake */}
            <div style={{
              position: 'absolute',
              bottom: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Outfit', cursive, sans-serif",
              fontSize: '4vmin',
              fontWeight: 800,
              color: '#ffffff',
              textShadow: '0 3px 10px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 12
            }}>
              🎉 Happy Birthday! 🎂
            </div>
          </div>
        </div>
      </div>

      {/* Swipe knife visual feedback */}
      {touchTrail.length > 1 && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
          <polyline
            points={touchTrail.map(p => `${p.x * 100}%,${p.y * 100}%`).join(' ')}
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            filter="drop-shadow(0 0 8px #ec4899)"
          />
        </svg>
      )}

      {/* Hint overlay on phone */}
      {!cakeCut && !isSimulator && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          zIndex: 50,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          ✨ Swipe virtual knife across screen to cut the cake!
        </div>
      )}
    </div>
  );
}
