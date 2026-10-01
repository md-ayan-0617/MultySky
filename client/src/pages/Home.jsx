import React, { useState } from 'react';
import { Smartphone, Layers, Play, Sparkles, QrCode, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function Home({ onNavigate, onQuickStartCake, onQuickStartCyber }) {
  const [manualCode, setManualCode] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onNavigate('join', { initialCode: manualCode.trim().toUpperCase() });
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px 80px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        {/* Neumorphic pill badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--nm-surface)',
          boxShadow: 'var(--nm-raised-sm)',
          padding: '10px 24px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: 'var(--accent-cyan)',
          marginBottom: '28px',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          <Sparkles size={16} /> Web-Based Multi-Device Display Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6.5vw, 4.4rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: '22px',
          color: 'var(--text-heading)'
        }}>
          Combine Multiple Phones into <br />
          <span className="gradient-text">One Giant Virtual Display</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-muted)',
          maxWidth: '700px',
          margin: '0 auto 44px',
          lineHeight: 1.65
        }}>
          Place smartphones side-by-side, pair via QR code, and watch synchronized 4K videos, 
          panoramic photos, and live interactive party games span seamlessly across all screens.
        </p>

        {/* Neumorphic Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary"
            style={{ padding: '16px 34px', fontSize: '1.08rem' }}
          >
            <Smartphone size={22} color="var(--accent-cyan)" /> Create Master Session
          </button>

          <button
            onClick={() => onNavigate('join')}
            className="btn-secondary"
            style={{ padding: '16px 30px', fontSize: '1.08rem' }}
          >
            <QrCode size={22} color="var(--accent-primary)" /> Join as Display Phone
          </button>

          <button
            onClick={onQuickStartCake}
            className="btn-secondary"
            style={{
              padding: '16px 28px',
              fontSize: '1.08rem',
              boxShadow: 'var(--nm-raised), var(--accent-glow-pink)'
            }}
          >
            🎂 Demo: Virtual Cake Party
          </button>

          <button
            onClick={onQuickStartCyber}
            className="btn-secondary"
            style={{
              padding: '16px 28px',
              fontSize: '1.08rem',
              boxShadow: 'var(--nm-raised), var(--accent-glow-cyan)'
            }}
          >
            ⚡ Demo: Cyber Wave Matrix
          </button>
        </div>

        {/* Neumorphic Sunken Well Join Form */}
        <form
          onSubmit={handleJoinSubmit}
          className="nm-well"
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <input
            type="text"
            placeholder="Enter Session Code (e.g. MS-7F42A9)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent !important',
              boxShadow: 'none !important',
              border: 'none !important',
              color: 'var(--text-main)',
              padding: '10px 14px',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
          >
            Join <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* Feature Showcase Grid — Neumorphic raised cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '28px',
        marginBottom: '64px'
      }}>
        {[
          { icon: <QrCode size={24} />, color: 'var(--accent-cyan)', title: 'Instant QR Code Pairing',
            desc: 'Zero apps or setup required. Friends simply point their smartphone camera at the master screen to join the synchronized wall in seconds.' },
          { icon: <Layers size={24} />, color: 'var(--accent-primary)', title: 'Automatic Region Splitting',
            desc: 'Hardware-accelerated HTML5 Canvas cropping engine divides high-res media dynamically for 1×2, 2×2, 2×3, or 3×3 grids with bezel compensation.' },
          { icon: <Sparkles size={24} />, color: 'var(--accent-pink)', title: 'Interactive Cake Experience',
            desc: 'Assemble phones for celebrations. Swipe a virtual knife across multiple phone screens to slice the cake with realistic physics, candle blowing, and confetti!' },
          { icon: <Zap size={24} />, color: 'var(--accent-cyan)', title: 'Cyber Wave Matrix',
            desc: 'Mesmerizing neon pulse waves scroll seamlessly across every screen. Tap any phone to send a synchronized ripple burst, toggle colors, speed, and glitch FX live!' }
        ].map((card, i) => (
          <div key={i} className="nm-card" style={{ padding: '32px 26px' }}>
            <div className="nm-icon-box" style={{ marginBottom: '20px', color: card.color }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '10px', fontWeight: 700 }}>
              {card.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Social Trend Banner — large neumorphic card */}
      <div className="nm-card" style={{
        padding: '48px 30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.85rem',
          color: 'var(--accent-cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 800,
          marginBottom: '10px'
        }}>
          Social Media Ready
        </div>
        <h2 style={{ fontSize: '2.1rem', color: 'var(--text-heading)', margin: '0 auto 14px', maxWidth: '750px', fontWeight: 800 }}>
          "When you meet friends or family, try this."
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
          Turn your gatherings, birthday parties, and hangouts into viral moments with an unforgettable synchronized multi-phone wall.
        </p>
      </div>
    </div>
  );
}
