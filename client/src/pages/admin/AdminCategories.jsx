import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} from '../../services/galleryApi';
import { uploadMedia } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const fileInputRef = useRef(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getCategories(true);
      if (res?.success) {
        setCategories(res.categories || []);
      }
    } catch (e) {
      console.warn('Error loading categories', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImageUrl('');
    setIsPublished(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setCoverImageUrl(cat.coverImageUrl || '');
    setIsPublished(cat.isPublished !== undefined ? cat.isPublished : true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug for new categories
      const genSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(genSlug);
    }
  };

  // Upload Cover Image via File Picker
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setFormError('');
    try {
      const res = await uploadMedia(file, `cover-${Date.now()}`);
      if (res?.success && res.media?.url) {
        setCoverImageUrl(res.media.url);
      } else {
        // Fallback to local base64 preview
        const reader = new FileReader();
        reader.onload = () => setCoverImageUrl(reader.result);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => setCoverImageUrl(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        isPublished
      };

      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, payload);
        if (res?.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          setFormError(res?.message || 'Failed to update category');
        }
      } else {
        const res = await createCategory(payload);
        if (res?.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          setFormError(res?.message || 'Failed to create category');
        }
      }
    } catch (err) {
      setFormError('Error saving category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Are you sure you want to delete "${catName}"? Associated images will also be removed.`)) {
      try {
        const res = await deleteCategory(id);
        if (res?.success) {
          setCategories(prev => prev.filter(c => c.id !== id));
        } else {
          alert(res?.message || 'Failed to delete category');
        }
      } catch (err) {
        alert('Error deleting category');
      }
    }
  };

  const handleTogglePublish = async (cat) => {
    try {
      const res = await updateCategory(cat.id, { isPublished: !cat.isPublished });
      if (res?.success) {
        setCategories(prev =>
          prev.map(c => (c.id === cat.id ? { ...c, isPublished: !c.isPublished } : c))
        );
      }
    } catch (err) {
      console.warn('Toggle publish error', err);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const list = [...categories];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    setCategories(list);
    try {
      await reorderCategories(list.map(c => c.id));
    } catch (e) {
      console.warn('Reorder error', e);
    }
  };

  return (
    <div className="admin-page-body">
      {/* ── Top Header Row ─────────────────────────────────────────────── */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Category Management</h1>
          <p className="admin-page-sub">
            Organize multi-screen collections, upload custom cover photos, and toggle visibility.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* ── Categories List Table / Cards ───────────────────────────────── */}
      {isLoading ? (
        <div className="admin-loading-screen">
          <div className="loading-spinner" />
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="clay-card admin-empty-card">
          <FolderTree size={44} opacity={0.4} />
          <h3>No Categories Created Yet</h3>
          <p>Create your first category collection to start grouping photos for public viewing.</p>
          <button onClick={openCreateModal} className="btn-primary" style={{ marginTop: '12px' }}>
            <Plus size={16} /> Create First Category
          </button>
        </div>
      ) : (
        <div className="clay-card categories-table-card">
          <div className="categories-grid-list">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="category-admin-card">
                <div className="cat-card-cover-wrap">
                  {cat.coverImageUrl ? (
                    <img src={cat.coverImageUrl} alt={cat.name} className="cat-card-cover-img" />
                  ) : (
                    <div className="cat-card-cover-placeholder">
                      <ImageIcon size={28} opacity={0.4} />
                      <span>No Cover</span>
                    </div>
                  )}
                  <span className={`status-pill ${cat.isPublished ? 'published' : 'hidden'}`}>
                    {cat.isPublished ? 'Live' : 'Hidden'}
                  </span>
                </div>

                <div className="cat-card-details">
                  <div className="cat-card-title-row">
                    <h3 className="cat-card-name">{cat.name}</h3>
                    <span className="cat-card-count">{cat.imagesCount || 0} images</span>
                  </div>
                  <div className="cat-card-slug">/gallery/{cat.slug}</div>
                  {cat.description && (
                    <p className="cat-card-desc">{cat.description}</p>
                  )}
                </div>

                <div className="cat-card-actions">
                  {/* Reorder Buttons */}
                  <div className="reorder-btn-group">
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="reorder-btn"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === categories.length - 1}
                      className="reorder-btn"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => handleTogglePublish(cat)}
                    className="icon-action-btn"
                    title={cat.isPublished ? 'Hide from public gallery' : 'Publish to gallery'}
                  >
                    {cat.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(cat)}
                    className="icon-action-btn"
                    title="Edit category"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="icon-action-btn danger"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create / Edit Category Modal (Section 7) ───────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-card clay-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="admin-error-banner" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="category-form">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday & Parties"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. birthday-parties"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-control"
                />
                <span className="input-hint">Public link: /gallery/{slug || '...'}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Describe this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-control textarea-control"
                  rows={3}
                />
              </div>

              {/* Cover Image Upload / URL Preview (Section 7) */}
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div className="cover-picker-box">
                  {coverImageUrl ? (
                    <div className="cover-preview-wrap">
                      <img src={coverImageUrl} alt="Cover preview" className="cover-preview-img" />
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="cover-remove-btn"
                        title="Remove cover image"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="cover-upload-zone">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleCoverUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="btn-secondary"
                      >
                        <Upload size={15} />
                        <span>{isUploadingCover ? 'Uploading...' : 'Upload Cover Image'}</span>
                      </button>
                      <span className="or-text">or paste image URL below</span>
                    </div>
                  )}

                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="input-control"
                    style={{ marginTop: '8px' }}
                  />
                </div>
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="admin-checkbox"
                  />
                  <span>Publish immediately to public gallery</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  <Check size={16} />
                  <span>{isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
