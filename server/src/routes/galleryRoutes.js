import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { galleryDB } from '../services/galleryService.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^\w-]/g, '_');
    cb(null, `img_${Date.now()}_${safeName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) && (mime.startsWith('image/') || mime === 'image/svg+xml')) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF, SVG) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter
});

// Helper to determine if requester is admin
const isAdminRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.headers['x-admin-token'];
  return galleryDB.validateAdminSession(token);
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC GALLERY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gallery — Public categories list with count and cover image
router.get('/gallery', (req, res) => {
  try {
    const categories = galleryDB.getCategories({ isPublic: true });
    return res.json({
      success: true,
      categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/gallery/:categorySlug — Public images belonging to category
router.get('/gallery/:categorySlug', (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = galleryDB.getCategoryBySlug(categorySlug, { isPublic: true });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unpublished'
      });
    }

    const images = galleryDB.getImages({
      categoryId: category.id,
      isPublic: true
    });

    return res.json({
      success: true,
      category,
      images
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/categories
router.get('/categories', (req, res) => {
  try {
    const isPublic = !isAdminRequest(req);
    const categories = galleryDB.getCategories({ isPublic });
    return res.json({
      success: true,
      categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories (Admin only)
router.post('/categories', requireAdminAuth, (req, res) => {
  try {
    const { name, slug, description, coverImageUrl, isPublished } = req.body;
    const category = galleryDB.createCategory({
      name,
      slug,
      description,
      coverImageUrl,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    return res.status(201).json({
      success: true,
      category,
      message: 'Category created successfully'
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/reorder (Admin only)
router.put('/categories/reorder', requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    const categories = galleryDB.reorderCategories(orderedIds);
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id (Admin only)
router.put('/categories/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = galleryDB.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.json({
      success: true,
      category: updated,
      message: 'Category updated successfully'
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id (Admin only)
router.delete('/categories/:id', requireAdminAuth, (req, res) => {
  try {
    const deleted = galleryDB.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.json({
      success: true,
      message: 'Category and associated images deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// IMAGES ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/images
router.get('/images', (req, res) => {
  try {
    const isPublic = !isAdminRequest(req);
    const { categoryId, categorySlug, isPublished, sourceType, search } = req.query;

    const images = galleryDB.getImages({
      categoryId,
      categorySlug,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
      sourceType,
      search,
      isPublic
    });

    return res.json({
      success: true,
      images
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/images (Admin only)
router.post('/images', requireAdminAuth, (req, res) => {
  try {
    const { categoryId, title, description, sourceType, imageUrl, storageUrl, thumbnailUrl, isPublished } = req.body;
    const image = galleryDB.createImage({
      categoryId,
      title,
      description,
      sourceType,
      imageUrl,
      storageUrl,
      thumbnailUrl,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    return res.status(201).json({
      success: true,
      image,
      message: 'Image added successfully'
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/images/bulk-url (Admin only)
router.post('/images/bulk-url', requireAdminAuth, (req, res) => {
  try {
    const { categoryId, urls = [] } = req.body;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' });
    }

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: 'urls array cannot be empty' });
    }

    const validItems = [];
    let invalidCount = 0;

    for (const item of urls) {
      const urlStr = typeof item === 'string' ? item.trim() : (item?.url || '').trim();
      if (!urlStr) continue;

      try {
        new URL(urlStr); // validates URL structure
        validItems.push({
          categoryId,
          title: item?.title || path.basename(new URL(urlStr).pathname).replace(/\.[^/.]+$/, '') || 'Gallery Image',
          description: item?.description || '',
          sourceType: 'external-url',
          imageUrl: urlStr,
          thumbnailUrl: urlStr,
          isPublished: item?.isPublished !== undefined ? item.isPublished : true
        });
      } catch {
        invalidCount++;
      }
    }

    const created = galleryDB.createBulkImages(validItems);

    return res.json({
      success: true,
      addedCount: created.length,
      invalidCount,
      images: created,
      message: `${created.length} image(s) added successfully.${invalidCount > 0 ? ` (${invalidCount} invalid URLs skipped)` : ''}`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/images/upload (Admin only — handles single or multiple files)
router.post('/images/upload', requireAdminAuth, upload.array('files', 15), (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const { categoryId, title, description } = req.body;

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required for uploaded images' });
    }

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const host = req.get('host') || 'localhost:3001';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const createdImages = [];

    for (const file of files) {
      const publicUrl = `${baseUrl}/uploads/${file.filename}`;
      const img = galleryDB.createImage({
        categoryId,
        title: title || path.basename(file.originalname, path.extname(file.originalname)),
        description: description || '',
        sourceType: 'upload',
        imageUrl: publicUrl,
        storageUrl: file.filename,
        thumbnailUrl: publicUrl,
        isPublished: true
      });
      createdImages.push(img);
    }

    return res.status(201).json({
      success: true,
      images: createdImages,
      image: createdImages[0], // for single upload
      message: `${createdImages.length} image(s) uploaded successfully`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/images/reorder (Admin only)
router.put('/images/reorder', requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    const images = galleryDB.reorderImages(orderedIds);
    return res.json({ success: true, images });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/images/:id (Admin only)
router.put('/images/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = galleryDB.updateImage(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    return res.json({
      success: true,
      image: updated,
      message: 'Image updated successfully'
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/images/:id (Admin only)
router.delete('/images/:id', requireAdminAuth, (req, res) => {
  try {
    const deleted = galleryDB.deleteImage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    return res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
