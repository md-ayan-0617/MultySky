import React, { useState, useEffect, useRef } from 'react';
import { Film, Image as ImageIcon, Sparkles, Upload, Check, Play, Cake, Trash2 } from 'lucide-react';
import { getMediaList, uploadMedia, deleteMedia } from '../services/api';

export default function MediaLibrary({ currentMedia, onSelectMedia, sessionId }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
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
      console.warn('Using local preset media fallback', e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), sessionId);
      if (res?.success && res.media) {
        setMediaItems(prev => [res.media, ...prev]);
        onSelectMedia(res.media);
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
      onSelectMedia(fallbackItem);
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

  const categories = ['All', 'Interactive', 'Images', 'Videos', 'Nature', 'Cakes', 'Space', 'Cities', 'Abstract', 'User Uploads'];

  const filteredMedia = mediaItems.filter(item => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Interactive') return item.type === 'interactive';
    if (activeCategory === 'Images') return item.type === 'image';
    if (activeCategory === 'Videos') return item.type === 'video';
    if (activeCategory === 'User Uploads') return item.category === 'User Uploads';
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(236, 72, 153, 0.2)',
            padding: '8px',
            borderRadius: '10px',
            color: '#f472b6',
            display: 'flex'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Media & Experience Library</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Choose a viral interactive experience, photo, or synchronized video
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
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Upload size={16} /> {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
              border: activeCategory === cat ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat === 'Interactive' && '✨ '}
            {cat}
          </button>
        ))}
      </div>

      {/* Media Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '14px',
        maxHeight: '440px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filteredMedia.map(item => {
          const isSelected = currentMedia?.id === item.id;
          const isInteractive = item.type === 'interactive';
          return (
            <div
              key={item.id}
              onClick={() => onSelectMedia(item)}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'none'
              }}
            >
              {/* Media Thumbnail */}
              <div style={{ position: 'relative', width: '100%', height: '115px', background: '#0a0d18' }}>
                <img
                  src={item.thumbnail || item.url}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: isInteractive
                    ? 'linear-gradient(135deg, #ec4899, #f59e0b)'
                    : item.type === 'video'
                    ? 'rgba(16, 185, 129, 0.85)'
                    : 'rgba(59, 130, 246, 0.85)',
                  color: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isInteractive ? <Cake size={12} /> : item.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                  {isInteractive ? 'Interactive Party' : item.type}
                </div>

                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#6366f1',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.8)'
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {item.category} {item.duration ? `• ${item.duration}s` : ''}
                  </div>
                </div>

                {item.category === 'User Uploads' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
