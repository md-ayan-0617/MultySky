import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Image as ImageIcon,
  Upload,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Smartphone,
  Shield,
  Eye
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/images', label: 'Images', icon: ImageIcon },
    { to: '/admin/upload', label: 'Upload Center', icon: Upload },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="admin-cms-layout">
      {/* ── Mobile Top Header Bar ──────────────────────────────────────── */}
      <header className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <div className="admin-logo-badge">
            <Shield size={18} />
          </div>
          <span className="admin-brand-title">MultiScreen CMS</span>
        </div>

        <div className="admin-mobile-actions">
          <Link to="/gallery" target="_blank" className="admin-external-link-btn" title="View Public Gallery">
            <Eye size={16} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="admin-hamburger-btn"
            aria-label="Toggle admin navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="admin-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <aside className="admin-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">Admin Navigation</div>
              <button onClick={() => setMobileMenuOpen(false)} className="drawer-close-btn">
                <X size={18} />
              </button>
            </div>

            <nav className="drawer-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="drawer-divider" />

              <Link
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="admin-nav-item external"
              >
                <Eye size={18} />
                <span>View Public Gallery</span>
                <ExternalLink size={14} className="ext-icon" />
              </Link>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="admin-nav-item external"
              >
                <Smartphone size={18} />
                <span>Main Website</span>
              </Link>

              <button onClick={handleLogout} className="admin-nav-item logout-btn">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* ── Desktop Fixed Sidebar ──────────────────────────────────────── */}
      <aside className="admin-desktop-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="sidebar-logo">
            <Shield size={20} />
          </div>
          <div>
            <div className="sidebar-brand-title">MultiScreen</div>
            <div className="sidebar-brand-sub">Gallery CMS Admin</div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="sidebar-nav-list">
          <div className="nav-group-label">MANAGEMENT</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-group-label" style={{ marginTop: '24px' }}>QUICK LINKS</div>
          <Link to="/gallery" target="_blank" className="admin-sidebar-link external">
            <Eye size={18} />
            <span>Public Gallery</span>
            <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
          </Link>

          <Link to="/" className="admin-sidebar-link external">
            <Smartphone size={18} />
            <span>Main Platform</span>
          </Link>
        </nav>

        {/* User Session Footer */}
        <div className="sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-status-dot" />
            <span className="admin-role-text">Master Administrator</span>
          </div>
          <button onClick={handleLogout} className="sidebar-logout-btn" title="Sign out of Admin CMS">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <main className="admin-main-viewport">
        <Outlet />
      </main>
    </div>
  );
}
