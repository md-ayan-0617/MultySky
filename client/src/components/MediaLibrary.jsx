import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Film, Image as ImageIcon, Sparkles, Upload, Check, Play, Trash2, Heart, Search, Eye, X, ArrowUpDown, Clock } from 'lucide-react';
import { getMediaList, uploadMedia, deleteMedia } from '../services/api';

export default function MediaLibrary({ currentMedia, onSelectMedia, sessionId }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ms-fav-media') || '[]');
    } catch {
      return [];
    }
  });
  const [recentIds, setRecentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ms-recent-media') || '[]');
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [previewItem, setPreviewItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await getMediaList();
      if (res?.success && res.media) {
        setMediaItems(res.media);
      }
    } catch (e) {
      console.warn('Using fallback media', e);
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('ms-fav-media', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelect = (item) => {
    // Add to recent
    setRecentIds(prev => {
      const next = [item.id, ...prev.filter(id => id !== item.id)].slice(0, 10);
      try {
        localStorage.setItem('ms-recent-media', JSON.stringify(next));
      } catch {}
      return next;
    });
    onSelectMedia(item);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), sessionId);
      if (res?.success && res.media) {
        setMediaItems(prev => [res.media, ...prev]);
        handleSelect(res.media);
      }
    } catch (err) {
      console.error('Upload failed, creating local object URL preview:', err);
      const localUrl = URL.createObjectURL(file);
      const isVid = file.type.startsWith('video');
      const fallbackItem = {
        id: `local-${Date.now()}`,
        name: file.name,
        type: isVid ? 'video' : 'image',
        category: 'User Uploads',
        url: localUrl,
        thumbnail: isVid ? 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=400' : localUrl
      };
      setMediaItems(prev => [fallbackItem, ...prev]);
      handleSelect(fallbackItem);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteMedia(id);
      setMediaItems(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.warn('Delete media error:', err);
    }
  };

  const categories = [
    'All',
    'Superheroes',
    'Cute / Pop Culture',
    'Celebration',
    'Space',
    'Interactive',
    'Nature',
    'Cities',
    'User Uploads'
  ];

  // Filtering & Sorting
  const filteredMedia = useMemo(() => {
    let list = mediaItems.filter(item => {
      // Category filter
      if (activeCategory !== 'All') {
        if (activeCategory === 'Interactive' && item.type !== 'interactive') return false;
        if (activeCategory !== 'Interactive' && item.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(item.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        const matchTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchTags) return false;
      }

      return true;
    });

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'category') {
      list = [...list].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }

    return list;
  }, [mediaItems, activeCategory, showFavoritesOnly, favorites, searchQuery, sortBy]);

  return (
    <div className="clay-card" style={{ padding: '24px', background: 'var(--clay-surface)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            color: '#4A1A2E',
            background: 'var(--clay-pink)',
            boxShadow: 'var(--clay-shadow-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>Media Library & Presets</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Superheroes, Pop Culture, Birthday Cakes, Space & Viral Visuals
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Upload size={14} /> {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Spider-Man, Cakes, Galaxy, Nebula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(v => !v)}
          className={showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontSize: '0.82rem' }}
        >
          <Heart size={14} fill={showFavoritesOnly ? '#fff' : 'none'} color={showFavoritesOnly ? '#fff' : 'var(--accent-pink)'} />
          Favorites ({favorites.length})
        </button>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'var(--nm-surface-light)',
            border: 'var(--border-subtle)',
            color: 'var(--text-main)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <option value="default">Default Order</option>
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '18px'
      }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat && !showFavoritesOnly;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setShowFavoritesOnly(false);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: isActive ? 'var(--btn-primary-bg)' : 'var(--nm-surface-light)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: isActive ? '1px solid transparent' : 'var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Media Cards Grid */}
      {filteredMedia.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--nm-surface-dark)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No media matching your filters.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '14px',
          maxHeight: '520px',
          overflowY: 'auto',
          padding: '2px'
        }}>
          {filteredMedia.map((item) => {
            const isSelected = currentMedia?.id === item.id;
            const isFav = favorites.includes(item.id);
            const isRecent = recentIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--nm-surface-light)',
                  border: isSelected ? '2px solid var(--accent-primary)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                {/* Thumbnail Image Container */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  background: '#090a10',
                  overflow: 'hidden'
                }}>
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {item.type.toUpperCase()}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(item);
                        }}
                        title="Preview Fullscreen"
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}
                      >
                        <Eye size={12} />
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(e, item.id)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isFav ? 'var(--accent-pink)' : '#fff'
                        }}
                      >
                        <Heart size={12} fill={isFav ? 'var(--accent-pink)' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Selected Pill Overlay */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Check size={12} /> Active
                    </div>
                  )}
                </div>

                {/* Card Title & Info */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.category || item.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FULLSCREEN PREVIEW MODAL ────────────────────────────────────────── */}
      {previewItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--nm-surface)',
            border: 'var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '720px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'var(--border-subtle)' }}>
              <div>
                <h4 style={{ color: 'var(--text-heading)', fontSize: '1.1rem' }}>{previewItem.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{previewItem.category} • {previewItem.type.toUpperCase()}</span>
              </div>
              <button onClick={() => setPreviewItem(null)} className="nm-btn-circle" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Media Content */}
            <div style={{ maxHeight: '420px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewItem.type === 'video' ? (
                <video src={previewItem.url} controls autoPlay muted loop style={{ maxWidth: '100%', maxHeight: '400px' }} />
              ) : (
                <img src={previewItem.url || previewItem.thumbnail} alt={previewItem.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPreviewItem(null)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSelect(previewItem);
                  setPreviewItem(null);
                }}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Apply to Screen Wall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
