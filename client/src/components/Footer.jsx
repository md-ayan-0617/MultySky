import React from 'react';
import { Smartphone, Heart, Sparkles, Shield, Cpu, QrCode } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleNav = (page, anchor = null) => {
    if (anchor) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    onNavigate(page);
  };

  return (
    <footer style={{
      background: 'var(--clay-surface)',
      borderTop: '2px solid rgba(48, 45, 61, 0.06)',
      padding: '56px 20px 36px',
      marginTop: '60px'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '36px',
        marginBottom: '48px'
      }}>
        {/* Brand Column */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'var(--clay-coral)',
              boxShadow: 'var(--clay-shadow-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Smartphone size={20} strokeWidth={2.4} />
            </div>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--text-heading)',
              fontFamily: 'var(--font-heading)'
            }}>
              MultiScreen
            </span>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '18px'
          }}>
            Combine multiple smartphones into one synchronized, tactile virtual display. Designed for parties, cake cutting, exhibits, and interactive experiences.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(157, 222, 184, 0.25)',
            color: '#144026',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <Sparkles size={14} color="#10B981" /> Supports 1–100 Phones
          </div>
        </div>

        {/* Product Column */}
        <div>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-heading)',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)'
          }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <button
                onClick={() => handleNav('create')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Create Session
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('join')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Join as Display Phone
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('home', 'grid-showcase')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Display Mode Experience
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('home', 'media-themes')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Media Themes & Library
              </button>
            </li>
          </ul>
        </div>

        {/* Features Column */}
        <div>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-heading)',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)'
          }}>
            Features
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <button
                onClick={() => handleNav('home', '100-phone-experience')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                100 Phone Grid Engine
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('home', 'features')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Real-Time Clock Sync
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('join')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Instant QR Camera Pairing
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('home', 'cake-timer-demo')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Synchronized Cake Timer
              </button>
            </li>
          </ul>
        </div>

        {/* Help & Support Column */}
        <div>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-heading)',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)'
          }}>
            Help & Info
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <button
                onClick={() => handleNav('home', 'how-it-works')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--clay-coral)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                How It Works Step-by-Step
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('gallery')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue, #2563EB)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Public Gallery
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('admin')}
                style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue, #2563EB)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Admin
              </button>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Vercel Frontend • Render Backend
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '2px solid rgba(48, 45, 61, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        color: 'var(--text-muted)',
        fontSize: '0.88rem'
      }}>
        <div>
          © {new Date().getFullYear()} MultiScreen Platform. Hand-crafted with tactile Claymorphism.
        </div>
        <div style={{ display: 'flex', gap: '18px' }}>
          <span>Privacy Friendly</span>
          <span>•</span>
          <span>Zero Binaries in Git</span>
          <span>•</span>
          <span>Mobile First</span>
        </div>
      </div>
    </footer>
  );
}
