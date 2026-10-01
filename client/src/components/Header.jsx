import React, { useState } from 'react';
import { Smartphone, Menu, X, PlusCircle, QrCode, Sparkles, Sun, Moon } from 'lucide-react';

export default function Header({ currentPage, onNavigate, theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page, anchor = null) => {
    setMobileMenuOpen(false);
    if (anchor && currentPage === 'home') {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onNavigate(page);
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(248, 245, 238, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '2px solid rgba(48, 45, 61, 0.05)',
      padding: '12px 20px',
      transition: 'all 0.25s ease'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Logo */}
        <div
          onClick={() => handleNav('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--clay-coral)',
            boxShadow: 'var(--clay-shadow-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Smartphone size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--text-heading)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              MultiScreen
            </div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--clay-coral)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Giant Display Wall
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="desktop-nav">
          <button
            onClick={() => handleNav('home')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: currentPage === 'home' ? 800 : 600,
              color: currentPage === 'home' ? 'var(--clay-coral)' : 'var(--text-secondary)',
              background: currentPage === 'home' ? 'rgba(255, 128, 111, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('home', 'how-it-works')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            How It Works
          </button>

          <button
            onClick={() => handleNav('home', 'features')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Features
          </button>

          <button
            onClick={() => handleNav('create')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: currentPage === 'create' ? 800 : 600,
              color: currentPage === 'create' ? 'var(--clay-coral)' : 'var(--text-secondary)',
              background: currentPage === 'create' ? 'rgba(255, 128, 111, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Create
          </button>

          <button
            onClick={() => handleNav('join')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: currentPage === 'join' ? 800 : 600,
              color: currentPage === 'join' ? 'var(--clay-coral)' : 'var(--text-secondary)',
              background: currentPage === 'join' ? 'rgba(255, 128, 111, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Join
          </button>
        </nav>

        {/* Right CTA & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Light Clay Mode' : 'Night Mode'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--clay-surface)',
                boxShadow: 'var(--shadow-sm)',
                border: 'var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Sun size={18} color="#F7D878" /> : <Moon size={18} />}
            </button>
          )}

          {/* Primary Create Button */}
          <button
            onClick={() => handleNav('create')}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <PlusCircle size={18} />
            <span>Create Session</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              padding: '8px',
              borderRadius: '12px',
              background: 'var(--clay-surface)',
              boxShadow: 'var(--shadow-sm)',
              border: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            className="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div
          className="clay-card animate-fade-in"
          style={{
            marginTop: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'var(--clay-surface)',
            border: 'var(--border-card)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <button
            onClick={() => handleNav('home')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: 700,
              textAlign: 'left',
              color: 'var(--text-primary)',
              background: 'var(--clay-surface-warm)'
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => handleNav('home', 'how-it-works')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: 700,
              textAlign: 'left',
              color: 'var(--text-primary)',
              background: 'var(--clay-surface-warm)'
            }}
          >
            💡 How It Works
          </button>

          <button
            onClick={() => handleNav('home', 'features')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: 700,
              textAlign: 'left',
              color: 'var(--text-primary)',
              background: 'var(--clay-surface-warm)'
            }}
          >
            ✨ Features (1–100 Phones)
          </button>

          <button
            onClick={() => handleNav('create')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: 700,
              textAlign: 'left',
              color: '#ffffff',
              background: 'var(--clay-coral)',
              boxShadow: 'var(--clay-shadow-coral)'
            }}
          >
            📱 Create Master Session
          </button>

          <button
            onClick={() => handleNav('join')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              fontWeight: 700,
              textAlign: 'left',
              color: 'var(--text-primary)',
              background: 'var(--clay-surface-warm)',
              border: '2px solid var(--clay-lavender)'
            }}
          >
            📷 Join Display Phone (QR)
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
