import React, { useState } from 'react';
import { Smartphone, Layers, Play, Sparkles, QrCode, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function Home({ onNavigate, onQuickStartCake }) {
  const [manualCode, setManualCode] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onNavigate('join', { initialCode: manualCode.trim().toUpperCase() });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '6px 18px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: '#a5b4fc',
          marginBottom: '20px',
          fontWeight: 600
        }}>
          <Sparkles size={16} /> Web-Based Multi-Device Media Display System
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: '20px'
        }}>
          Combine Multiple Phones into <br />
          <span className="gradient-text">One Giant Virtual Display</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Place smartphones side-by-side, pair via QR code, and watch images, 
          synchronized 4K videos, and interactive party experiences span seamlessly across all screens.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={() => onNavigate('create')}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          >
            <Smartphone size={22} /> Create Master Session
          </button>

          <button
            onClick={() => onNavigate('join')}
            className="btn-secondary"
            style={{ padding: '16px 28px', fontSize: '1.1rem' }}
          >
            <QrCode size={22} /> Join as Display Phone
          </button>

          <button
            onClick={onQuickStartCake}
            className="btn-secondary"
            style={{
              padding: '16px 28px',
              fontSize: '1.1rem',
              borderColor: 'rgba(236, 72, 153, 0.4)',
              color: '#f472b6'
            }}
          >
            🎂 Quick Demo: Virtual Cake Party
          </button>
        </div>

        {/* Quick Join By Code Bar */}
        <form
          onSubmit={handleJoinSubmit}
          style={{
            maxWidth: '440px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px',
            borderRadius: '16px'
          }}
        >
          <input
            type="text"
            placeholder="Enter Session Code (e.g. MS-7F42A9)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '10px 14px',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 18px' }}>
            Join <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* Feature Showcase Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '60px'
      }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc',
            marginBottom: '18px'
          }}>
            <QrCode size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
            Instant QR Code Pairing
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            No apps to download. Friends simply point their phone camera at your screen to join the session in seconds.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee',
            marginBottom: '18px'
          }}>
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
            Automatic Region Splitting
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Advanced HTML5 Canvas cropping engine divides high-res media dynamically for 1×2, 2×2, 2×3, or 3×3 grids.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{
            background: 'rgba(236, 72, 153, 0.15)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f472b6',
            marginBottom: '18px'
          }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
            Interactive Cake Experience
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Combine phones for celebrations. Swipe a virtual knife across screens to slice the cake with confetti & candles!
          </p>
        </div>
      </div>

      {/* Social Trend Banner */}
      <div className="glass-panel" style={{
        padding: '36px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <span style={{ fontSize: '0.85rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          Social Media Ready
        </span>
        <h2 style={{ fontSize: '2rem', color: '#fff', margin: '10px 0 12px' }}>
          “When you meet friends or family, try this.”
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Turn your gatherings, birthday parties, and hangouts into viral moments with an unforgettable synchronized multi-phone wall.
        </p>
      </div>
    </div>
  );
}
