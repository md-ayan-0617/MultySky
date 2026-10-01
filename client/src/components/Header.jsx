import React, { useState } from 'react';
import { Smartphone, Menu, X, PlusCircle, Sun, Moon } from 'lucide-react';

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
    <header className="app-header">
      <div className="header-inner">
        {/* Left: Compact Brand & Logo */}
        <div
          className="header-brand"
          onClick={() => handleNav('home')}
          title="MultiScreen Home"
        >
          <div className="header-logo-icon">
            <Smartphone size={18} strokeWidth={2.4} />
          </div>
          <div className="header-brand-text">
            <span className="brand-title">MultiScreen</span>
            <span className="brand-subtitle">Giant Display Wall</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button
            onClick={() => handleNav('home')}
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('home', 'how-it-works')}
            className="nav-link"
          >
            How It Works
          </button>

          <button
            onClick={() => handleNav('home', 'features')}
            className="nav-link"
          >
            Features
          </button>

          <button
            onClick={() => handleNav('create')}
            className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
          >
            Create
          </button>

          <button
            onClick={() => handleNav('join')}
            className={`nav-link ${currentPage === 'join' ? 'active' : ''}`}
          >
            Join
          </button>
        </nav>

        {/* Right: Actions (Theme Toggle + Create Session + Menu Toggle) */}
        <div className="header-actions">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} color="#F7D878" />
              ) : (
                <Moon size={18} color="var(--text-secondary)" />
              )}
            </button>
          )}

          {/* Primary Create Button */}
          <button
            onClick={() => handleNav('create')}
            className="header-create-btn btn-primary"
            aria-label="Create Session"
          >
            <PlusCircle size={15} />
            <span className="create-text-full">Create Session</span>
            <span className="create-text-short">Create</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="clay-card mobile-drawer animate-fade-in">
          <button
            onClick={() => handleNav('home')}
            className="mobile-drawer-link"
          >
            🏠 Home
          </button>

          <button
            onClick={() => handleNav('home', 'how-it-works')}
            className="mobile-drawer-link"
          >
            💡 How It Works
          </button>

          <button
            onClick={() => handleNav('home', 'features')}
            className="mobile-drawer-link"
          >
            ✨ Features (1–100 Phones)
          </button>

          <button
            onClick={() => handleNav('create')}
            className="mobile-drawer-link primary"
          >
            📱 Create Master Session
          </button>

          <button
            onClick={() => handleNav('join')}
            className="mobile-drawer-link secondary"
          >
            📷 Join Display Phone (QR)
          </button>
        </div>
      )}
    </header>
  );
}
