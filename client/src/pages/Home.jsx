import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Sparkles,
  Layers,
  Clock,
  Maximize2,
  Tv,
  CheckCircle,
  Play,
  RotateCcw,
  Users,
  Compass,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Gift,
  Film
} from 'lucide-react';

export default function Home({ onNavigate, onQuickStartCake, onQuickStartCyber }) {
  const [manualCode, setManualCode] = useState('');
  const [heroLayout, setHeroLayout] = useState('2x2'); // '1x1' | '1x2' | '2x2' | '3x3' | '10x10'
  const [typingIndex, setTypingIndex] = useState(0);

  // Subtle Typing Animation
  const typingWords = [
    'Your phones. One giant display.',
    'Connect. Arrange. Synchronize.',
    'Up to 100 smartphones together.',
    'Instant QR pairing in seconds.',
    'One screen. Endless party fun.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingIndex((prev) => (prev + 1) % typingWords.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [typingWords.length]);

  // Synchronized Cake Timer Demo state
  const [cakeTimer, setCakeTimer] = useState(10);
  const [cakeRunning, setCakeRunning] = useState(false);
  const [cakeCelebrated, setCakeCelebrated] = useState(false);

  useEffect(() => {
    let interval = null;
    if (cakeRunning) {
      interval = setInterval(() => {
        setCakeTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCakeRunning(false);
            setCakeCelebrated(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cakeRunning]);

  const startCakeDemo = () => {
    setCakeCelebrated(false);
    setCakeTimer(10);
    setCakeRunning(true);
  };

  const resetCakeDemo = () => {
    setCakeRunning(false);
    setCakeCelebrated(false);
    setCakeTimer(10);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onNavigate('join', { initialCode: manualCode.trim().toUpperCase() });
    }
  };

  // Helper for rendering hero grid
  const getGridConfig = (layoutKey) => {
    switch (layoutKey) {
      case '1x1':
        return { rows: 1, cols: 1, count: 1 };
      case '1x2':
        return { rows: 1, cols: 2, count: 2 };
      case '2x2':
        return { rows: 2, cols: 2, count: 4 };
      case '3x3':
        return { rows: 3, cols: 3, count: 9 };
      case '10x10':
        return { rows: 10, cols: 10, count: 100 };
      default:
        return { rows: 2, cols: 2, count: 4 };
    }
  };

  const currentGrid = getGridConfig(heroLayout);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* ── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', marginBottom: '80px' }}>
        {/* Playful Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--clay-surface)',
            border: 'var(--border-subtle)',
            padding: '8px 22px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            color: 'var(--accent-primary, #2563EB)',
            fontWeight: 800,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '28px'
          }}
        >
          <Sparkles size={16} /> Multy-sky
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '20px',
            color: 'var(--text-heading)'
          }}
        >
          Multy-sky <br />
          <span style={{ color: 'var(--accent-primary, #2563EB)' }}>One Giant Screen</span>
        </h1>

        {/* Subtle Animated Subtitle */}
        <div
          style={{
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <span
            key={typingIndex}
            className="animate-fade-in"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--clay-lavender)',
              background: 'rgba(185, 167, 247, 0.15)',
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block'
            }}
          >
            ✨ {typingWords[typingIndex]}
          </span>
        </div>

        {/* Supporting Text */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          Connect multiple smartphones, arrange them into a synchronized grid, and turn them into one giant visual
          display.
        </p>

        {/* Hero Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '44px'
          }}
        >
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '1.05rem' }}
          >
            <Smartphone size={22} /> CREATE SESSION
          </button>

          <button
            onClick={() => onNavigate('join')}
            className="btn-secondary"
            style={{ padding: '16px 30px', fontSize: '1.05rem' }}
          >
            <QrCode size={22} color="var(--clay-coral)" /> JOIN SESSION
          </button>
        </div>

        {/* Quick Join Code Form */}
        <form
          onSubmit={handleJoinSubmit}
          style={{
            maxWidth: '460px',
            margin: '0 auto 56px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--clay-surface)',
            border: 'var(--border-card)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <input
            type="text"
            placeholder="Enter Session Code (e.g. MS-ABC123)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Join <ArrowRight size={16} />
          </button>
        </form>

        {/* ── INTERACTIVE GRID VISUAL (1x1, 1x2, 2x2, 3x3, 10x10) ──────────── */}
        <div
          className="clay-card"
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: '28px 24px',
            background: 'var(--clay-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--clay-coral)', textTransform: 'uppercase' }}>
                Interactive Simulation
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Grid Matrix Preview ({currentGrid.count} Phones)
              </h3>
            </div>

            {/* Grid Preset Switches */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--clay-surface-warm)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                gap: '4px'
              }}
            >
              {['1x1', '1x2', '2x2', '3x3', '10x10'].map((gridKey) => (
                <button
                  key={gridKey}
                  onClick={() => setHeroLayout(gridKey)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: heroLayout === gridKey ? 800 : 600,
                    background: heroLayout === gridKey ? 'var(--clay-coral)' : 'transparent',
                    color: heroLayout === gridKey ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: heroLayout === gridKey ? 'var(--clay-shadow-coral)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {gridKey}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Phone Grid Shell */}
          <div
            style={{
              background: 'var(--clay-surface-warm)',
              padding: heroLayout === '10x10' ? '12px' : '20px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(48, 45, 61, 0.04)',
              minHeight: '260px',
              display: 'grid',
              gridTemplateRows: `repeat(${currentGrid.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${currentGrid.cols}, 1fr)`,
              gap: heroLayout === '10x10' ? '3px' : '10px',
              aspectRatio: heroLayout === '10x10' ? '1/1' : currentGrid.cols / currentGrid.rows > 1 ? '16/9' : '4/3',
              maxHeight: '380px',
              margin: '0 auto',
              overflow: 'hidden'
            }}
          >
            {Array.from({ length: currentGrid.count }).map((_, idx) => (
              <div
                key={idx}
                className="nm-phone-shell"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: heroLayout === '10x10' ? '2px' : '8px',
                  background: idx === 0 ? 'rgba(185, 167, 247, 0.35)' : 'var(--clay-surface)',
                  border: idx === 0 ? '2px solid var(--clay-lavender)' : '2px solid rgba(255,255,255,0.85)'
                }}
              >
                {heroLayout !== '10x10' && (
                  <>
                    <span
                      style={{
                        fontSize: currentGrid.count > 4 ? '0.75rem' : '0.95rem',
                        fontWeight: 900,
                        color: 'var(--text-heading)'
                      }}
                    >
                      P{String(idx + 1).padStart(2, '0')}
                    </span>
                    {idx === 0 && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          background: 'var(--clay-lavender)',
                          color: '#271E47',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-full)',
                          marginTop: '2px'
                        }}
                      >
                        MASTER
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px'
                      }}
                    >
                      ● Online
                    </span>
                  </>
                )}
                {heroLayout === '10x10' && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--clay-coral)' : '#10B981'
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>✨ Seamless synchronized viewport slice for each screen</span>
            <button
              onClick={() => onNavigate('create')}
              style={{
                color: 'var(--clay-coral)',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Start this layout <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS SECTION ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--clay-coral)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Simple 3-Step Setup
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '6px' }}>
            How It Works
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Step 1 */}
          <div
            className="clay-card clay-card-lavender"
            style={{ padding: '32px 24px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.3rem',
                color: '#271E47',
                marginBottom: '20px'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px' }}>Create Master Session</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
              Select your grid configuration from 2 up to 100 smartphones (1x2 to 10x10). Choose your starting theme or
              cake celebration.
            </p>
            <div style={{ marginTop: '20px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Create session now <ArrowRight size={16} />
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="clay-card clay-card-mint"
            style={{ padding: '32px 24px', cursor: 'pointer' }}
            onClick={() => onNavigate('join')}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.3rem',
                color: '#144026',
                marginBottom: '20px'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px' }}>Pair Phones via QR</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
              Place phones side by side on a table or wall. Scan the session QR with each camera to instantly register
              their grid slot.
            </p>
            <div style={{ marginTop: '20px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Open QR camera <ArrowRight size={16} />
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="clay-card clay-card-peach"
            style={{ padding: '32px 24px', cursor: 'pointer' }}
            onClick={onQuickStartCake}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.3rem',
                color: '#4A2318',
                marginBottom: '20px'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px' }}>Synchronize & Play</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
              Tap Enter Display Mode on all phones. Every phone keeps its screen awake and plays videos, photos, and
              interactive timers in perfect unison.
            </p>
            <div style={{ marginTop: '20px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Launch instant demo <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION (8 Colorful Solid Clay Cards) ────────────── */}
      <section id="features" style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--clay-coral)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Crafted with Care
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '6px' }}>
            Built for Modern Multi-Device Displays
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Card 1: QR Pairing (Mint) */}
          <div
            className="clay-card clay-card-mint"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => onNavigate('join')}
          >
            <QrCode size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>QR Pairing</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Scan directly from mobile browser with instant camera permissions and zero app install required.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Try camera pairing <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Real-time Sync (Blue) */}
          <div
            className="clay-card clay-card-blue"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={startCakeDemo}
          >
            <Zap size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Real-time Sync</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Low-latency Socket.IO room broadcast with server NTP clock compensation for frame-accurate playback.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Test clock sync <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 3: 100 Phone Grid (Lavender) */}
          <div
            className="clay-card clay-card-lavender"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => setHeroLayout('10x10')}
          >
            <Layers size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>100 Phone Grid</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Scale up to a massive 10x10 wall of 100 smartphones with smart aspect-ratio grid arrangements.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View 100 grid <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 4: Full-screen Display (Yellow) */}
          <div
            className="clay-card clay-card-yellow"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => onNavigate('join')}
          >
            <Maximize2 size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Full-screen Display</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Uses Fullscreen API & Screen Wake Lock so phones stay awake with YouTube-style tap controls.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Display screen flow <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 5: Live Grid Preview (Peach) */}
          <div
            className="clay-card clay-card-peach"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <Tv size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Live Grid Preview</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Master dashboard shows real-time device tiles: P01 ● Connected with identify strobe and position reordering.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Create master session <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 6: Synchronized Media (Pink) */}
          <div
            className="clay-card clay-card-pink"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => {
              const el = document.getElementById('media-themes');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Film size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Synchronized Media</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Superheroes, Birthday cakes, Galaxies, and custom video uploads sliced across phone viewports.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore themes <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 7: Master + Display (Lavender) */}
          <div
            className="clay-card clay-card-lavender"
            style={{ padding: '26px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <Smartphone size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Master + Display</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
              Host phone can join its own grid as P01 while remaining full session controller without disconnects.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Join grid as host <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 8: Celebration Timer (Coral) */}
          <div
            className="clay-card"
            style={{
              padding: '26px',
              cursor: 'pointer',
              background: 'var(--clay-coral)',
              color: '#ffffff',
              boxShadow: 'var(--clay-shadow-coral)'
            }}
            onClick={() => {
              const el = document.getElementById('cake-timer-demo');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Clock size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>Celebration Timer</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.55, opacity: 0.95 }}>
              Synchronized 10s countdown for birthdays and cake cutting, triggering interactive cuts on all phones at once.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View cake demo <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SYNCHRONIZED BIRTHDAY CAKE TIMER DEMO ─────────────────────── */}
      <section
        id="cake-timer-demo"
        className="clay-card"
        style={{
          padding: '40px 28px',
          marginBottom: '80px',
          background: 'var(--clay-surface)',
          border: 'var(--border-card)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 128, 111, 0.15)',
                color: 'var(--clay-coral)',
                fontSize: '0.85rem',
                fontWeight: 800,
                marginBottom: '12px'
              }}
            >
              🎂 Interactive Party Feature
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Synchronized Cake Timer
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              All phones in the session share the exact server timestamp. When the host triggers the countdown, every
              screen synchronizes to 00:00 and fires a synchronized virtual cake-cutting celebration.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={startCakeDemo}
                className="btn-primary"
                disabled={cakeRunning}
                style={{ padding: '12px 24px', opacity: cakeRunning ? 0.7 : 1 }}
              >
                <Play size={18} /> {cakeRunning ? 'Counting Down...' : 'Start 10s Demo'}
              </button>

              <button onClick={resetCakeDemo} className="btn-secondary" style={{ padding: '12px 20px' }}>
                <RotateCcw size={18} /> Reset
              </button>

              <button onClick={onQuickStartCake} className="btn-secondary" style={{ padding: '12px 20px' }}>
                <Smartphone size={18} color="var(--clay-coral)" /> Full Cake Session
              </button>
            </div>
          </div>

          {/* Interactive Timer Display */}
          <div
            className="clay-card clay-card-yellow"
            style={{
              padding: '36px 48px',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              minWidth: '240px'
            }}
          >
            {cakeCelebrated ? (
              <div className="animate-fade-in">
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉 🎂 🎊</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4A3A12' }}>CAKE CUT!</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6A531A', marginTop: '6px' }}>
                  Synchronized on all phones
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6A531A'
                  }}
                >
                  CAKE CUT IN
                </div>
                <div
                  style={{
                    fontSize: '5rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    margin: '12px 0',
                    fontFamily: 'var(--font-mono)',
                    color: '#4A3A12'
                  }}
                >
                  00:{String(cakeTimer).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7A6020' }}>
                  {cakeRunning ? '● All screens ticking in sync' : 'Press Start to test'}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. MEDIA THEMES SECTION ──────────────────────────────────────── */}
      <section id="media-themes" style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--clay-coral)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Rich Visual Library
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '6px' }}>
            Playful Media Themes
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
            Browse curated multi-screen themes hosted on ultra-fast CDNs. Slices automatically calculate to fit your exact
            phone grid.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Theme 1: Superheroes */}
          <div
            className="clay-card clay-card-lavender"
            style={{ padding: '24px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  background: '#FFFFFF',
                  color: '#271E47',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                SUPERHEROES
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>12+ Artworks</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Marvel & DC Legends</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.9 }}>
              Iron Man, Spider-Man, Batman, Hulk, Thor, and Captain America spanning across your smartphones.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Launch with superheroes <ArrowRight size={14} />
            </div>
          </div>

          {/* Theme 2: Birthday & Cake */}
          <div
            className="clay-card clay-card-peach"
            style={{ padding: '24px', cursor: 'pointer' }}
            onClick={onQuickStartCake}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  background: '#FFFFFF',
                  color: '#4A2318',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                BIRTHDAY & CAKE
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Interactive</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Virtual Cake Celebration</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.9 }}>
              Interactive 3D-styled cake slice with blowable candles, confetti blasts, and synchronized cutting timers.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Try virtual cake <ArrowRight size={14} />
            </div>
          </div>

          {/* Theme 3: Space & Galaxy */}
          <div
            className="clay-card clay-card-blue"
            style={{ padding: '24px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  background: '#FFFFFF',
                  color: '#17384A',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                GALAXY & SPACE
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>8+ Panoramas</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Deep Cosmos & Nebulas</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.9 }}>
              High-definition planetary orbits, James Webb deep field galaxies, and interstellar solar flares.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore space themes <ArrowRight size={14} />
            </div>
          </div>

          {/* Theme 4: Cute & Pop Culture */}
          <div
            className="clay-card clay-card-pink"
            style={{ padding: '24px', cursor: 'pointer' }}
            onClick={() => onNavigate('create')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  background: '#FFFFFF',
                  color: '#4A1A2E',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                CUTE & POP
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>10+ Collections</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Barbie, Unicorn & Sakura</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.9 }}>
              Pastel candy dreams, glowing unicorns, cute princess kingdoms, and floating cherry blossoms.
            </p>
            <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Launch cute collection <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. USE CASES SECTION ────────────────────────────────────────── */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--clay-coral)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Versatile Experiences
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '6px' }}>
            Use Cases
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}
        >
          {[
            {
              icon: '🎉',
              title: 'Birthday Parties',
              desc: 'Lay phones together on the cake table for an unforgettable countdown and synchronized photo wall.'
            },
            {
              icon: '🎨',
              title: 'Art Exhibits',
              desc: 'Assemble 10 to 50 phones as an ultra-high resolution dynamic digital art installation.'
            },
            {
              icon: '🎓',
              title: 'Classrooms & STEM',
              desc: 'Teach matrix coordinates, aspect ratios, and distributed synchronized computing in real time.'
            },
            {
              icon: '🚀',
              title: 'Store Displays & Popups',
              desc: 'Create an eye-catching video showcase using affordable phones without expensive display hardware.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="clay-card"
              style={{
                padding: '24px',
                background: 'var(--clay-surface)',
                border: 'var(--border-card)'
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. FAQ ACCORDION ────────────────────────────────────────────── */}
      <section id="faq" style={{ marginBottom: '80px', maxWidth: '820px', margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--clay-coral)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Clear Answers
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '6px' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            {
              q: 'Can the phone that creates the session also be used as a screen?',
              a: 'Yes! The Master controller phone has a dedicated "JOIN GRID" button. It occupies a chosen grid slot (like P01) and displays synchronized media while keeping full session control.'
            },
            {
              q: 'Do other phones need to install any app or log in?',
              a: 'No app install or login is needed. Any iPhone, Android, or tablet simply opens the camera, scans the QR code, and taps "Enter Display Mode".'
            },
            {
              q: 'How many phones can connect in one session?',
              a: 'Multy-sky supports anywhere from 2 phones (1x2) up to 100 physical smartphones (10x10) simultaneously, with smart responsive grid scaling.'
            },
            {
              q: 'Will the screens turn off during the show?',
              a: 'No! When phones enter Display Mode, Multy-sky automatically activates the Screen Wake Lock API to prevent the display from sleeping or dimming.'
            }
          ].map((faq, i) => (
            <div
              key={i}
              className="clay-card"
              style={{
                padding: '20px 24px',
                background: 'var(--clay-surface)'
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
                {faq.q}
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL CTA SECTION ────────────────────────────────────────── */}
      <section
        className="clay-card"
        style={{
          padding: '56px 28px',
          textAlign: 'center',
          background: 'var(--clay-surface)',
          border: 'var(--border-card)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱 📱 📱</div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 900,
            color: 'var(--text-heading)',
            marginBottom: '14px'
          }}
        >
          Ready to Build Your Giant Screen?
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}
        >
          Create your session in 5 seconds. Connect your friends phones and light up the room together.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
          >
            <Smartphone size={22} /> CREATE SESSION
          </button>

          <button
            onClick={() => onNavigate('join')}
            className="btn-secondary"
            style={{ padding: '16px 32px', fontSize: '1.05rem' }}
          >
            <QrCode size={22} color="var(--clay-coral)" /> JOIN WITH PHONE
          </button>
        </div>
      </section>
    </div>
  );
}
