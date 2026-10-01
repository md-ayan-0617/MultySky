import React, { useState } from 'react';
import { Smartphone, Layers, Play, Sparkles, QrCode, ArrowRight, ShieldCheck, Zap, Users, Monitor } from 'lucide-react';

export default function Home({ onNavigate, onQuickStartCake, onQuickStartCyber }) {
  const [manualCode, setManualCode] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onNavigate('join', { initialCode: manualCode.trim().toUpperCase() });
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--nm-surface)',
          border: 'var(--border-subtle)',
          padding: '8px 20px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: 'var(--accent-primary)',
          marginBottom: '24px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Sparkles size={16} /> Web-Based Multi-Device Display Platform (Supports 1–100 Phones)
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: '20px',
          color: 'var(--text-heading)'
        }}>
          Combine Multiple Phones into <br />
          <span style={{
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            One Giant Virtual Display Wall
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Assemble 2 to 100 smartphones side-by-side, pair instantly via QR code, and watch synchronized media,
          superhero art, panoramic photo walls, and live interactive games span seamlessly across every screen.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <Smartphone size={20} /> Create Master Session
          </button>

          <button
            onClick={() => onNavigate('join')}
            className="btn-secondary"
            style={{ padding: '14px 26px', fontSize: '1rem' }}
          >
            <QrCode size={20} color="var(--accent-primary)" /> Join as Display Phone
          </button>

          <button
            onClick={onQuickStartCake}
            className="btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1rem' }}
          >
            🎂 Demo: Cake Cutting
          </button>

          <button
            onClick={onQuickStartCyber}
            className="btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1rem' }}
          >
            ⚡ Demo: Cyber Wave
          </button>
        </div>

        {/* Quick Join Code Form */}
        <form
          onSubmit={handleJoinSubmit}
          style={{
            maxWidth: '440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--nm-surface)',
            border: 'var(--border-card)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-lg)',
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
              color: 'var(--text-main)',
              padding: '8px 12px',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Join <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* Feature Showcase Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        {[
          {
            icon: <QrCode size={22} />,
            color: 'var(--accent-cyan)',
            title: 'Instant QR Code Pairing',
            desc: 'Zero app installs or setup. Friends point their camera at the master screen to link their phone to the multi-device grid in seconds.'
          },
          {
            icon: <Layers size={22} />,
            color: 'var(--accent-primary)',
            title: 'Scalable 1 to 100 Phones',
            desc: 'Hardware-accelerated viewport cropping engine divides media dynamically for any grid from standard 2×2 up to 100 phones.'
          },
          {
            icon: <Sparkles size={22} />,
            color: 'var(--accent-pink)',
            title: 'Virtual Birthday Cake Party',
            desc: 'Swipe a virtual knife across physical screens to slice the cake with synchronized physics, candle blowing, confetti, and music.'
          },
          {
            icon: <Zap size={22} />,
            color: 'var(--accent-cyan)',
            title: 'Cyber Wave Matrix',
            desc: 'Neon energy pulses flowing continuously across every device. Tap any phone to send live synchronized ripples across the entire room.'
          }
        ].map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '28px 24px' }}>
            <div className="nm-icon-box" style={{ width: '42px', height: '42px', marginBottom: '16px', color: card.color, background: 'var(--nm-surface-light)' }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', marginBottom: '8px', fontWeight: 700 }}>
              {card.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Social Banner */}
      <div className="glass-panel" style={{
        padding: '40px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--nm-surface) 0%, var(--nm-surface-light) 100%)'
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          color: 'var(--accent-cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          Events • Parties • Gatherings
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-heading)', margin: '0 auto 10px', maxWidth: '680px', fontWeight: 800 }}>
          "When you meet friends or family, try this."
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.6 }}>
          Turn your gatherings, birthdays, and parties into viral moments with an unforgettable synchronized multi-screen wall.
        </p>
      </div>
    </div>
  );
}
