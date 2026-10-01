import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Eye, Images, Sparkles, Folder, Maximize2 } from 'lucide-react';
import { getCategoryImages } from '../../services/galleryApi';

export default function CategoryGallery() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox modal state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getCategoryImages(categorySlug);
        if (res?.success) {
          setCategory(res.category);
          setImages(res.images || []);
        } else {
          setError(res?.message || 'Collection not found or unavailable');
        }
      } catch (err) {
        setError('Network error loading collection images');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }, [lightboxIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  }, [lightboxIndex, images.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev, handleClose]);

  return (
    <div className="gallery-page-container">
      {/* ── Breadcrumb Navigation ─────────────────────────────────────── */}
      <div className="gallery-top-bar">
        <Link to="/gallery" className="btn-secondary back-nav-btn">
          <ArrowLeft size={16} /> All Collections
        </Link>
        <span className="gallery-crumb-sep">/</span>
        <span className="gallery-crumb-current">{category?.name || categorySlug}</span>
      </div>

      {isLoading ? (
        <div className="gallery-loading-box">
          <div className="loading-spinner" />
          <p>Loading collection photos...</p>
        </div>
      ) : error ? (
        <div className="clay-card gallery-error-box">
          <h3>Collection Not Found</h3>
          <p>{error}</p>
          <Link to="/gallery" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Return to Collections
          </Link>
        </div>
      ) : (
        <>
          {/* ── Category Header Card ──────────────────────────────────── */}
          <div className="category-header-banner clay-card">
            {category?.coverImageUrl && (
              <div className="banner-cover-wrap">
                <img src={category.coverImageUrl} alt={category.name} className="banner-cover-img" />
              </div>
            )}
            <div className="banner-content">
              <div className="banner-badge">
                <Sparkles size={15} /> Collection Overview
              </div>
              <h1 className="banner-title">{category?.name}</h1>
              {category?.description && (
                <p className="banner-desc">{category.description}</p>
              )}
              <div className="banner-stats">
                <span className="stat-chip">
                  <Images size={14} /> {images.length} {images.length === 1 ? 'Image' : 'Images'}
                </span>
                <span className="stat-chip active">
                  ✓ Public Display Ready
                </span>
              </div>
            </div>
          </div>

          {/* ── Images Grid ───────────────────────────────────────────── */}
          {images.length === 0 ? (
            <div className="clay-card gallery-empty-state">
              <Folder size={44} opacity={0.4} />
              <h3>No Images in this Collection Yet</h3>
              <p>The administrator has not added published images to this collection yet.</p>
              <Link to="/gallery" className="btn-secondary" style={{ marginTop: '12px', display: 'inline-flex' }}>
                Browse Other Collections
              </Link>
            </div>
          ) : (
            <div className="gallery-images-masonry">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="gallery-image-card"
                >
                  <div className="image-card-thumb-wrap">
                    <img
                      src={img.thumbnailUrl || img.imageUrl}
                      alt={img.title || 'Gallery item'}
                      className="image-card-thumb"
                      loading="lazy"
                    />
                    <div className="image-hover-overlay">
                      <div className="hover-action-pill">
                        <Maximize2 size={16} />
                        <span>Preview Fullscreen</span>
                      </div>
                    </div>
                  </div>
                  <div className="image-card-meta">
                    <h4 className="image-card-title">{img.title || 'Untitled Image'}</h4>
                    {img.description && (
                      <p className="image-card-sub">{img.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Fullscreen Interactive Lightbox Modal ────────────────────── */}
      {lightboxIndex !== null && activeImage && (
        <div className="lightbox-overlay" onClick={handleClose}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar */}
            <div className="lightbox-toolbar">
              <div className="lightbox-counter">
                {lightboxIndex + 1} of {images.length}
              </div>
              <button onClick={handleClose} className="lightbox-close-btn" aria-label="Close Preview">
                <X size={20} />
              </button>
            </div>

            {/* Main Image Display Area */}
            <div className="lightbox-media-container">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title || 'Full preview'}
                className="lightbox-main-img"
              />

              {/* Prev / Next Floating Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="lightbox-arrow-btn prev" aria-label="Previous Image">
                    <ChevronLeft size={28} />
                  </button>
                  <button onClick={handleNext} className="lightbox-arrow-btn next" aria-label="Next Image">
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption */}
            <div className="lightbox-caption">
              <h3 className="caption-title">{activeImage.title || 'Untitled Image'}</h3>
              {activeImage.description && (
                <p className="caption-desc">{activeImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
