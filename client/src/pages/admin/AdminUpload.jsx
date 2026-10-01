import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCategories, 
  uploadImageFile, 
  createImage, 
  bulkCreateImages, 
  createCategory 
} from '../../services/galleryApi';

export default function AdminUpload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('direct'); // direct | single | bulk
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Common or shared fields
  const [selectedCatId, setSelectedCatId] = useState('');
  
  // Quick Category Creation Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Direct Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [directTitle, setDirectTitle] = useState('');
  const [directDesc, setDirectDesc] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Single URL State
  const [singleUrl, setSingleUrl] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleDesc, setSingleDesc] = useState('');
  const [singlePublished, setSinglePublished] = useState(true);
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  // Bulk URLs State
  const [bulkText, setBulkText] = useState('');
  const [parsedBulkUrls, setParsedBulkUrls] = useState([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // Global notification feedback
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const data = await getCategories();
      setCategories(data || []);
      if (data && data.length > 0 && !selectedCatId) {
        setSelectedCatId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCats(false);
    }
  };

  const handleQuickCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const created = await createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        isPublished: true
      });
      setCategories(prev => [...prev, created]);
      setSelectedCatId(created.id);
      setShowCatModal(false);
      setNewCatName('');
      setNewCatDesc('');
      setFeedback({ type: 'success', message: `Category "${created.name}" created!` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create category' });
    } finally {
      setCreatingCat(false);
    }
  };

  // --- Direct Upload Handlers ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    const previews = valid.map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      previewUrl: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...previews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDirectUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one image file.' });
      return;
    }
    setIsUploading(true);
    setUploadProgress(10);
    setFeedback(null);

    let successCount = 0;
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const formData = new FormData();
        formData.append('image', item.file);
        formData.append('categoryId', selectedCatId || '');
        formData.append('title', directTitle || item.name.replace(/\.[^/.]+$/, ""));
        formData.append('description', directDesc);
        formData.append('isPublished', 'true');

        await uploadImageFile(formData);
        successCount++;
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      setFeedback({
        type: 'success',
        message: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}!`
      });
      setSelectedFiles([]);
      setDirectTitle('');
      setDirectDesc('');
      setTimeout(() => navigate('/admin/images'), 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Direct upload failed' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Single URL Handlers ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleUrl.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid image URL.' });
      return;
    }
    setIsSavingSingle(true);
    setFeedback(null);
    try {
      await createImage({
        categoryId: selectedCatId,
        title: singleTitle.trim() || 'External Image',
        description: singleDesc.trim(),
        sourceType: 'external-url',
        imageUrl: singleUrl.trim(),
        isPublished: singlePublished
      });
      setFeedback({ type: 'success', message: 'Image URL successfully added!' });
      setSingleUrl('');
      setSingleTitle('');
      setSingleDesc('');
      setTimeout(() => navigate('/admin/images'), 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save image' });
    } finally {
      setIsSavingSingle(false);
    }
  };

  // --- Bulk URLs Handlers ---
  const handleBulkTextChange = (text) => {
    setBulkText(text);
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = lines.map((url, idx) => {
      const isValid = /^https?:\/\/.+/i.test(url);
      return { id: idx, url, isValid, selected: isValid };
    });
    setParsedBulkUrls(parsed);
  };

  const toggleBulkSelect = (id) => {
    setParsedBulkUrls(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const removeBulkUrl = (id) => {
    setParsedBulkUrls(prev => prev.filter(item => item.id !== id));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const validSelected = parsedBulkUrls.filter(u => u.isValid && u.selected);
    if (validSelected.length === 0) {
      setFeedback({ type: 'error', message: 'No valid and selected image URLs to add.' });
      return;
    }

    setIsSavingBulk(true);
    setFeedback(null);
    try {
      const imagesToCreate = validSelected.map((u, i) => ({
        categoryId: selectedCatId,
        title: `Image ${i + 1}`,
        sourceType: 'external-url',
        imageUrl: u.url,
        isPublished: true
      }));

      const res = await bulkCreateImages(imagesToCreate);
      setFeedback({
        type: 'success',
        message: `${res.length} images added successfully!`
      });
      setBulkText('');
      setParsedBulkUrls([]);
      setTimeout(() => navigate('/admin/images'), 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Bulk upload failed' });
    } finally {
      setIsSavingBulk(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Upload Center</h1>
          <p className="admin-page-subtitle">Add images to your gallery via file upload, single URL, or bulk URLs.</p>
        </div>
      </div>

      {feedback && (
        <div className={`admin-alert admin-alert-${feedback.type === 'success' ? 'success' : 'danger'}`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Direct Upload
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Single Image URL
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Bulk Image URLs
        </button>
      </div>

      {/* Target Category Selector Bar (Shared) */}
      <div className="admin-category-selector-card">
        <div className="admin-category-selector-row">
          <div>
            <label className="admin-label">Assign Category</label>
            <p className="admin-hint">Choose which category these images will belong to.</p>
          </div>
          <div className="admin-category-selector-actions">
            <select 
              value={selectedCatId} 
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="admin-select"
              disabled={loadingCats}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {categories.length === 0 && (
                <option value="">No categories available</option>
              )}
            </select>

            <button 
              type="button" 
              onClick={() => setShowCatModal(true)}
              className="admin-btn admin-btn-secondary"
            >
              + Create Category
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: DIRECT UPLOAD */}
      {activeTab === 'direct' && (
        <form onSubmit={handleDirectUploadSubmit} className="admin-upload-panel">
          <div 
            className={`admin-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="image/png,image/jpeg,image/webp,image/jpg" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="admin-dropzone-icon">☁️</div>
            <h3>Drag & Drop Image Files Here</h3>
            <p>Supports JPG, JPEG, PNG, WEBP (Max 10MB per file)</p>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: '0.75rem' }}>
              Browse Files
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="admin-previews-section">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="admin-preview-grid">
                {selectedFiles.map((fileObj, idx) => (
                  <div key={idx} className="admin-preview-card">
                    <img src={fileObj.previewUrl} alt={fileObj.name} />
                    <div className="admin-preview-info">
                      <span className="admin-preview-name">{fileObj.name}</span>
                      <span className="admin-preview-size">{fileObj.size}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)} 
                      className="admin-preview-remove"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="admin-upload-meta-fields">
                <div className="admin-form-group">
                  <label>Title (Optional, will default to filename)</label>
                  <input 
                    type="text" 
                    value={directTitle} 
                    onChange={(e) => setDirectTitle(e.target.value)} 
                    className="admin-input" 
                    placeholder="E.g., MultiScreen Party Celebration"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Description (Optional)</label>
                  <input 
                    type="text" 
                    value={directDesc} 
                    onChange={(e) => setDirectDesc(e.target.value)} 
                    className="admin-input" 
                    placeholder="Short description for these images"
                  />
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="admin-progress-container">
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="admin-progress-text">Uploading... {uploadProgress}%</span>
            </div>
          )}

          <div className="admin-upload-actions">
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary admin-btn-lg"
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SINGLE IMAGE URL */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="admin-upload-panel">
          <div className="admin-form-group">
            <label>Image URL *</label>
            <input 
              type="url" 
              required
              placeholder="https://images.unsplash.com/photo-..." 
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="admin-input"
            />
            <span className="admin-hint">Paste any direct public link to a PNG, JPG, or WEBP image.</span>
          </div>

          {singleUrl && (
            <div className="admin-url-preview-box">
              <label>Live URL Preview</label>
              <div className="admin-url-preview-img">
                <img 
                  src={singleUrl} 
                  alt="Preview" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  onLoad={(e) => { e.target.style.display = 'block'; }}
                />
              </div>
            </div>
          )}

          <div className="admin-form-group">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="Image title (optional)" 
              value={singleTitle}
              onChange={(e) => setSingleTitle(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea 
              rows="3"
              placeholder="Short description (optional)" 
              value={singleDesc}
              onChange={(e) => setSingleDesc(e.target.value)}
              className="admin-textarea"
            />
          </div>

          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input 
                type="checkbox" 
                checked={singlePublished} 
                onChange={(e) => setSinglePublished(e.target.checked)} 
              />
              <span>Publish immediately in public gallery</span>
            </label>
          </div>

          <div className="admin-upload-actions">
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary admin-btn-lg"
              disabled={!singleUrl || isSavingSingle}
            >
              {isSavingSingle ? 'Saving...' : 'Add Image to Gallery'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BULK IMAGE URLS */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="admin-upload-panel">
          <div className="admin-form-group">
            <label>Bulk Image URLs (One URL per line) *</label>
            <textarea 
              rows="6"
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg&#10;https://example.com/photo3.jpg"
              value={bulkText}
              onChange={(e) => handleBulkTextChange(e.target.value)}
              className="admin-textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            <span className="admin-hint">Paste multiple image URLs separated by newlines. System will validate each link.</span>
          </div>

          {parsedBulkUrls.length > 0 && (
            <div className="admin-bulk-validation-section">
              <div className="admin-bulk-summary-bar">
                <span>
                  Detected {parsedBulkUrls.length} URL{parsedBulkUrls.length === 1 ? '' : 's'} — 
                  <strong style={{ color: '#22c55e' }}> {parsedBulkUrls.filter(u => u.isValid).length} Valid</strong>, 
                  <strong style={{ color: '#ef4444' }}> {parsedBulkUrls.filter(u => !u.isValid).length} Invalid</strong>
                </span>
              </div>

              <div className="admin-bulk-preview-list">
                {parsedBulkUrls.map(item => (
                  <div key={item.id} className={`admin-bulk-item ${!item.isValid ? 'invalid' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={item.selected} 
                      disabled={!item.isValid}
                      onChange={() => toggleBulkSelect(item.id)}
                    />
                    
                    {item.isValid ? (
                      <div className="admin-bulk-thumb">
                        <img 
                          src={item.url} 
                          alt="preview" 
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'; }}
                        />
                      </div>
                    ) : (
                      <div className="admin-bulk-thumb-invalid">⚠️</div>
                    )}

                    <div className="admin-bulk-url-text">{item.url}</div>

                    {!item.isValid && <span className="admin-bulk-bad-badge">Invalid Link</span>}

                    <button 
                      type="button" 
                      onClick={() => removeBulkUrl(item.id)}
                      className="admin-icon-btn admin-icon-btn-danger"
                      title="Remove URL"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-upload-actions">
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary admin-btn-lg"
              disabled={parsedBulkUrls.filter(u => u.isValid && u.selected).length === 0 || isSavingBulk}
            >
              {isSavingBulk ? 'Adding...' : `Add All ${parsedBulkUrls.filter(u => u.isValid && u.selected).length} Valid Images`}
            </button>
          </div>
        </form>
      )}

      {/* Quick Category Creation Modal */}
      {showCatModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h3>Create New Category</h3>
              <button className="admin-modal-close" onClick={() => setShowCatModal(false)}>✕</button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="admin-modal-body">
              <div className="admin-form-group">
                <label>Category Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g., NGO Events" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  className="admin-input" 
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea 
                  rows="2" 
                  placeholder="Optional description" 
                  value={newCatDesc} 
                  onChange={(e) => setNewCatDesc(e.target.value)} 
                  className="admin-textarea" 
                />
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setShowCatModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary" 
                  disabled={creatingCat || !newCatName.trim()}
                >
                  {creatingCat ? 'Creating...' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
