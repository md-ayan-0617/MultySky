import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Shield, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to dashboard immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the administrator password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await login(password.trim());
      if (res?.success) {
        const target = location.state?.from?.pathname || '/admin/dashboard';
        navigate(target, { replace: true });
      } else {
        setError(res?.message || 'Invalid administrator password');
      }
    } catch (err) {
      setError('Connection error authenticating admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-top">
        <Link to="/" className="btn-secondary back-nav-btn">
          <ArrowLeft size={16} /> Back to Website
        </Link>
      </div>

      <div className="clay-card admin-login-card">
        <div className="admin-login-icon-box">
          <Lock size={32} />
        </div>

        <div className="admin-login-header">
          <div className="admin-security-pill">
            <Shield size={14} /> Multy-sky CMS
          </div>
          <h1 className="admin-login-heading">Administrator Portal</h1>
          <p className="admin-login-subtext">
            Enter the authorized administrator password to manage gallery collections, upload media, and configure settings.
          </p>
        </div>

        {error && (
          <div className="admin-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Admin Security Key</label>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-control login-input"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary admin-auth-submit-btn"
          >
            <Shield size={16} />
            <span>{isSubmitting ? 'Authenticating...' : 'Unlock CMS Dashboard'}</span>
          </button>
        </form>

        <div className="admin-login-footer-info">
          <span>Protected by Server Authentication</span>
        </div>
      </div>
    </div>
  );
}
