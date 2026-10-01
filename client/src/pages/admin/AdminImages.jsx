import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAdminImages, 
  deleteImage, 
  updateImage, 
  getCategories, 
  reorderImages 
} from '../../services/galleryApi';

export default function AdminImages() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  // Edit Modal State
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCatId, setEditCatId] = useState('');
  const [editPublished, setEditPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal State
  const [deletingImage, setDeletingImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [imgsData, catsData] = await Promise.all([
        getAdminImages(),
        getCategories()
      ]);
      setImages(imgsData || []);
      setCategories(catsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (img) => {
    try {
      const updated = await updateImage(img.id, { isPublished: !img.isPublished });
      setImages(prev => prev.map(item => item.id === img.id ? updated : item));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    setEditTitle(img.title || '');
    setEditDesc(img.description || '');
    setEditCatId(img.categoryId || '');
    setEditPublished(img.isPublished !== false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    setIsSaving(true);
    try {
      const updated = await updateImage(editingImage.id, {
        title: editTitle,
        description: editDesc,
        categoryId: editCatId,
        isPublished: editPublished
      });
      setImages(prev => prev.map(item => item.id === editingImage.id ? updated : item));
      setEditingImage(null);
    } catch (err) {
      alert(err.message || 'Failed to update image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingImage) return;
    setIsDeleting(true);
    try {
      await deleteImage(deletingImage.id);
      setImages(prev => prev.filter(item => item.id !== deletingImage.id));
      setDeletingImage(null);
    } catch (err) {
      alert(err.message || 'Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= filteredImages.length) return;

    const reordered = [...filteredImages];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    // Apply new displayOrder
    const orderedIds = reordered.map(item => item.id);
    try {
      await reorderImages(orderedIds);
      // update state
      const idOrderMap = {};
      orderedIds.forEach((id, idx) => { idOrderMap[id] = idx; });
      setImages(prev => [...prev].sort((a, b) => (idOrderMap[a.id] ?? 999) - (idOrderMap[b.id] ?? 999)));
    } catch (err) {
      alert('Failed to reorder images: ' + err.message);
    }
  };

  // Filter images
  const filteredImages = images.filter(img => {
    // Search
    const matchesSearch = !search || 
      (img.title && img.title.toLowerCase().includes(search.toLowerCase())) ||
      (img.description && img.description.toLowerCase().includes(search.toLowerCase()));
    
    // Category
    const matchesCat = selectedCat === 'all' || img.categoryId === selectedCat;

    // Status
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'published' && img.isPublished) ||
      (selectedStatus === 'unpublished' && !img.isPublished);

    // Source
    const matchesSource = selectedSource === 'all' || img.sourceType === selectedSource;

    return matchesSearch && matchesCat && matchesStatus && matchesSource;
  });

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gallery Images</h1>
          <p className="admin-page-subtitle">Manage, edit, reorder, and organize all uploaded and external media.</p>
        </div>
        <Link to="/admin/upload" className="admin-btn admin-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Images
        </Link>
      </div>

      {error && <div className="admin-alert admin-alert-danger">{error}</div>}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          {search && (
            <button className="admin-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="admin-filter-selects">
          <select 
            value={selectedCat} 
            onChange={(e) => setSelectedCat(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished / Hidden</option>
          </select>

          <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Sources</option>
            <option value="upload">Uploaded Files</option>
            <option value="external-url">External URL</option>
          </select>
        </div>
      </div>

      {/* Images List / Table */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading media library...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="admin-empty-card">
          <div className="admin-empty-icon">🖼️</div>
          <h3>No Images Found</h3>
          <p>
            {images.length === 0 
              ? "You haven't added any images to the gallery yet." 
              : "No images match the current filter or search criteria."}
          </p>
          <Link to="/admin/upload" className="admin-btn admin-btn-primary">
            Upload or Add Images
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th style={{ width: '100px' }}>Preview</th>
                <th>Title & Info</th>
                <th>Category</th>
                <th>Source</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((img, idx) => (
                <tr key={img.id} className={!img.isPublished ? 'row-unpublished' : ''}>
                  {/* Order */}
                  <td>
                    <div className="admin-order-controls">
                      <button 
                        onClick={() => handleMoveOrder(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="admin-order-btn"
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => handleMoveOrder(idx, 1)}
                        disabled={idx === filteredImages.length - 1}
                        title="Move Down"
                        className="admin-order-btn"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td>
                    <div className="admin-table-thumb">
                      <img 
                        src={img.imageUrl} 
                        alt={img.title || 'Gallery item'} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'; }}
                      />
                    </div>
                  </td>

                  {/* Title & Desc */}
                  <td>
                    <div className="admin-table-info">
                      <div className="admin-table-title">{img.title || 'Untitled Image'}</div>
                      {img.description && (
                        <div className="admin-table-desc">{img.description}</div>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="admin-badge-category">
                      {getCategoryName(img.categoryId)}
                    </span>
                  </td>

                  {/* Source */}
                  <td>
                    <span className={`admin-badge-source ${img.sourceType}`}>
                      {img.sourceType === 'upload' ? '📁 Upload' : '🔗 URL'}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td>
                    <button 
                      onClick={() => handleTogglePublish(img)}
                      className={`admin-status-toggle ${img.isPublished ? 'active' : 'inactive'}`}
                      title={img.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                    >
                      <span className="admin-status-dot"></span>
                      {img.isPublished ? 'Published' : 'Hidden'}
                    </button>
                  </td>

                  {/* Date */}
                  <td className="admin-table-date">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-table-actions">
                      <button 
                        onClick={() => openEditModal(img)} 
                        className="admin-icon-btn" 
                        title="Edit image"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setDeletingImage(img)} 
                        className="admin-icon-btn admin-icon-btn-danger" 
                        title="Delete image"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Edit Image Details</h3>
              <button className="admin-modal-close" onClick={() => setEditingImage(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="admin-modal-body">
              <div className="admin-edit-preview">
                <img src={editingImage.imageUrl} alt="Preview" />
              </div>

              <div className="admin-form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="admin-input"
                  placeholder="Enter image title"
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)} 
                  className="admin-textarea"
                  placeholder="Optional description"
                />
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <select 
                  value={editCatId} 
                  onChange={(e) => setEditCatId(e.target.value)}
                  className="admin-select"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-checkbox-group">
                <label className="admin-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={editPublished} 
                    onChange={(e) => setEditPublished(e.target.checked)} 
                  />
                  <span>Published (Visible in public gallery)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary" 
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingImage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h3>Delete Image?</h3>
              <button className="admin-modal-close" onClick={() => setDeletingImage(null)}>✕</button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-delete-warning">
                <img 
                  src={deletingImage.imageUrl} 
                  alt="Thumbnail" 
                  className="admin-delete-thumb" 
                />
                <p>
                  Are you sure you want to delete <strong>"{deletingImage.title || 'Untitled Image'}"</strong>? 
                  This will remove it from the database and public gallery.
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary" 
                onClick={() => setDeletingImage(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="admin-btn admin-btn-danger" 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
