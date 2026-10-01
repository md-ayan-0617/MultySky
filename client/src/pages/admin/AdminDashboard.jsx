import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Image as ImageIcon,
  CheckCircle,
  Link as LinkIcon,
  Upload,
  ArrowRight,
  PlusCircle,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getAdminStats, getCategories } from '../../services/galleryApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, catRes] = await Promise.all([
        getAdminStats(),
        getCategories(true)
      ]);
      if (statsRes?.success) setStats(statsRes.stats);
      if (catRes?.success) setCategories(catRes.categories || []);
    } catch (e) {
      console.warn('Dashboard load error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="admin-page-body">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Gallery CMS Overview</h1>
          <p className="admin-page-sub">
            Monitor public collections, media assets, and storage distribution across the platform.
          </p>
        </div>

        <div className="admin-header-actions">
          <button onClick={loadData} className="btn-secondary" title="Refresh metrics">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <Link to="/admin/upload" className="btn-primary">
            <Upload size={16} />
            <span>Upload Images</span>
          </Link>
        </div>
      </div>

      {/* ── Summary Stat Cards (Section 5) ──────────────────────────────── */}
      <div className="admin-stats-grid">
        <div className="stat-card clay-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
            <FolderTree size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-value">{isLoading ? '—' : stats?.totalCategories ?? 0}</span>
            <span className="stat-label">Total Categories</span>
          </div>
          <Link to="/admin/categories" className="stat-corner-link">
            <span>Manage</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div className="stat-card clay-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(96, 165, 250, 0.1)', color: '#3B82F6' }}>
            <ImageIcon size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-value">{isLoading ? '—' : stats?.totalImages ?? 0}</span>
            <span className="stat-label">Total Images</span>
          </div>
          <Link to="/admin/images" className="stat-corner-link">
            <span>View All</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div className="stat-card clay-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-value">{isLoading ? '—' : stats?.publishedImages ?? 0}</span>
            <span className="stat-label">Published Live</span>
          </div>
          <Link to="/gallery" target="_blank" className="stat-corner-link">
            <span>Live Gallery</span> <Eye size={13} />
          </Link>
        </div>

        <div className="stat-card clay-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <LinkIcon size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-value">{isLoading ? '—' : stats?.externalImages ?? 0}</span>
            <span className="stat-label">External URLs</span>
          </div>
          <div className="stat-sub-text">CDN Hosted</div>
        </div>
      </div>

      {/* ── Content Grid: Recent Uploads & Active Categories ────────────── */}
      <div className="admin-two-col-grid">
        {/* Recent Uploads Section */}
        <div className="clay-card admin-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Recent Media Assets</h3>
              <p className="section-card-sub">Recently uploaded or linked gallery images</p>
            </div>
            <Link to="/admin/images" className="section-header-link">
              <span>All Images</span> <ArrowRight size={14} />
            </Link>
          </div>

          {!stats?.recentUploads || stats.recentUploads.length === 0 ? (
            <div className="admin-mini-empty">
              <ImageIcon size={32} opacity={0.4} />
              <p>No recent images found</p>
              <Link to="/admin/upload" className="btn-secondary" style={{ marginTop: '8px' }}>
                <PlusCircle size={14} /> Add First Image
              </Link>
            </div>
          ) : (
            <div className="recent-images-grid">
              {stats.recentUploads.map((img) => (
                <div key={img.id} className="recent-thumb-card">
                  <img src={img.thumbnailUrl || img.imageUrl} alt={img.title} className="recent-thumb-img" />
                  <div className="recent-thumb-overlay">
                    <span className="recent-thumb-title">{img.title}</span>
                    <span className="recent-thumb-cat">{img.categoryName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Overview Section */}
        <div className="clay-card admin-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Active Categories</h3>
              <p className="section-card-sub">Curated collections visible to public viewers</p>
            </div>
            <Link to="/admin/categories" className="section-header-link">
              <span>Manage</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div className="categories-list-compact">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.id} className="category-compact-row">
                <div className="cat-compact-cover">
                  {cat.coverImageUrl ? (
                    <img src={cat.coverImageUrl} alt={cat.name} className="cat-compact-img" />
                  ) : (
                    <FolderTree size={18} opacity={0.5} />
                  )}
                </div>
                <div className="cat-compact-info">
                  <span className="cat-compact-name">{cat.name}</span>
                  <span className="cat-compact-count">{cat.imagesCount || 0} images</span>
                </div>
                <span className={`status-pill ${cat.isPublished ? 'published' : 'hidden'}`}>
                  {cat.isPublished ? 'Published' : 'Hidden'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
