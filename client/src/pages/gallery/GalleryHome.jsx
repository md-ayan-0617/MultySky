import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Images, ArrowRight, Sparkles, Folder, Eye, Home } from 'lucide-react';
import { getPublicGallery } from '../../services/galleryApi';

export default function GalleryHome() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getPublicGallery();
        if (res?.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        } else {
          setError(res?.message || 'Could not load gallery categories');
        }
      } catch (err) {
        setError('Network error loading public gallery');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="gallery-page-container">
      {/* ── Top Navigation & Breadcrumb ─────────────────────────────────── */}
      <div className="gallery-top-bar">
        <Link to="/" className="btn-secondary back-nav-btn">
          <Home size={16} /> Home
        </Link>
        <span className="gallery-crumb-sep">/</span>
        <span className="gallery-crumb-current">Public Wall Gallery</span>
      </div>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="gallery-hero-card clay-card">
        <div className="gallery-hero-badge">
          <Sparkles size={16} /> Curated MultiScreen Visual Collections
        </div>
        <h1 className="gallery-hero-title">Public Screen Gallery</h1>
        <p className="gallery-hero-sub">
          Explore synchronized high-definition wallpapers, celebration themes, cyber visuals, and party backdrops designed for multi-phone display walls.
        </p>
      </div>

      {/* ── Categories Grid ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="gallery-loading-box">
          <div className="loading-spinner" />
          <p>Loading curated collections...</p>
        </div>
      ) : error && categories.length === 0 ? (
        <div className="clay-card gallery-error-box">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '12px' }}>
            Retry Loading
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="clay-card gallery-empty-state">
          <Folder size={48} opacity={0.4} />
          <h3>No Public Collections Yet</h3>
          <p>Collections published by the administrator will appear here for all users.</p>
        </div>
      ) : (
        <div className="gallery-categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/gallery/${cat.slug}`}
              className="category-card clay-card"
            >
              {/* Cover Image Container */}
              <div className="category-cover-wrap">
                {cat.coverImageUrl ? (
                  <img
                    src={cat.coverImageUrl}
                    alt={cat.name}
                    className="category-cover-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="category-cover-fallback">
                    <Images size={32} opacity={0.5} />
                  </div>
                )}
                <div className="category-count-badge">
                  <Images size={13} />
                  <span>{cat.imagesCount || 0} {cat.imagesCount === 1 ? 'Image' : 'Images'}</span>
                </div>
              </div>

              {/* Category Info */}
              <div className="category-info-body">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">
                  {cat.description || 'Explore high-resolution displays in this collection.'}
                </p>
                <div className="category-view-link">
                  <span>View Collection</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
