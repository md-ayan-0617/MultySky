import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'gallery.json');
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed categories and images
const SEED_CATEGORIES = [
  {
    id: 'cat-cyber',
    name: 'Cyber Matrix',
    slug: 'cyber-matrix',
    description: 'Neon cyber pulses, geometric visualizers and flowing data matrix streams for synchronized walls.',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-01T00:00:00.000Z').toISOString()
  },
  {
    id: 'cat-birthday',
    name: 'Birthday & Celebrations',
    slug: 'birthday-celebrations',
    description: 'Celebration cakes, synchronized countdown timers, candle glows, and festive confetti displays.',
    coverImageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
    isPublished: true,
    displayOrder: 2,
    createdAt: new Date('2026-09-02T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-02T00:00:00.000Z').toISOString()
  },
  {
    id: 'cat-superheroes',
    name: 'Superheroes & Sci-Fi',
    slug: 'superheroes-sci-fi',
    description: 'High-energy comic book icons, armor displays, cosmic battles, and dark knight skylines.',
    coverImageUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1200&auto=format&fit=crop&q=80',
    isPublished: true,
    displayOrder: 3,
    createdAt: new Date('2026-09-03T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-03T00:00:00.000Z').toISOString()
  },
  {
    id: 'cat-nature',
    name: 'Nature & Landscapes',
    slug: 'nature-landscapes',
    description: 'Scenic aerial ocean coastlines, starry galaxy night skies, auroras, and peaceful horizons.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    isPublished: true,
    displayOrder: 4,
    createdAt: new Date('2026-09-04T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-04T00:00:00.000Z').toISOString()
  },
  {
    id: 'cat-events',
    name: 'Events & Exhibitions',
    slug: 'events-exhibitions',
    description: 'Stage lighting, party crowds, live performances, and multi-device interactive showcases.',
    coverImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
    isPublished: true,
    displayOrder: 5,
    createdAt: new Date('2026-09-05T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-05T00:00:00.000Z').toISOString()
  }
];

const SEED_IMAGES = [
  {
    id: 'img-cyber-1',
    categoryId: 'cat-cyber',
    title: 'Neon Cyber City Skyline',
    description: 'Glowing blue and cyan cyber skyscrapers with digital rain grid.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-01T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-01T10:00:00.000Z').toISOString()
  },
  {
    id: 'img-cyber-2',
    categoryId: 'cat-cyber',
    title: 'Abstract Neural Grid',
    description: 'High-frequency digital wave matrix nodes connecting across screens.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 2,
    createdAt: new Date('2026-09-01T11:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-01T11:00:00.000Z').toISOString()
  },
  {
    id: 'img-cake-1',
    categoryId: 'cat-birthday',
    title: 'Celebration Berry Cake',
    description: 'Triple layer celebration sponge cake decorated with fresh berries and chocolate glaze.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-02T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-02T10:00:00.000Z').toISOString()
  },
  {
    id: 'img-cake-2',
    categoryId: 'cat-birthday',
    title: 'Candle Light Glow Moments',
    description: 'Golden glowing candles lit for synchronized birthday celebrations.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 2,
    createdAt: new Date('2026-09-02T11:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-02T11:00:00.000Z').toISOString()
  },
  {
    id: 'img-hero-1',
    categoryId: 'cat-superheroes',
    title: 'Iron Man Arc Reactor Armor',
    description: 'Crimson and gold Mark LXXXV armor with glowing blue arc reactor core.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-03T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-03T10:00:00.000Z').toISOString()
  },
  {
    id: 'img-hero-2',
    categoryId: 'cat-superheroes',
    title: 'Spider-Man Cyber Skyline Leap',
    description: 'Peter Parker leaping over the Manhattan night skyline under moonlight.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 2,
    createdAt: new Date('2026-09-03T11:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-03T11:00:00.000Z').toISOString()
  },
  {
    id: 'img-nature-1',
    categoryId: 'cat-nature',
    title: 'Tropical Ocean Coast Waves',
    description: 'Aerial turquoise sea waves rolling onto sandy coastlines in ultra high resolution.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-04T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-04T10:00:00.000Z').toISOString()
  },
  {
    id: 'img-events-1',
    categoryId: 'cat-events',
    title: 'Stage Concert Lights & Waves',
    description: 'Laser light projections and electric crowd energy at evening music festival.',
    sourceType: 'external-url',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    storageUrl: null,
    isPublished: true,
    displayOrder: 1,
    createdAt: new Date('2026-09-05T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-05T10:00:00.000Z').toISOString()
  }
];

class GalleryDatabase {
  constructor() {
    this.categories = [];
    this.images = [];
    this.sessions = new Map(); // active admin tokens
    this.failedAttempts = new Map(); // ip -> { count, lockedUntil }
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.categories = Array.isArray(data.categories) ? data.categories : [...SEED_CATEGORIES];
        this.images = Array.isArray(data.images) ? data.images : [...SEED_IMAGES];
      } else {
        this.categories = [...SEED_CATEGORIES];
        this.images = [...SEED_IMAGES];
        this.save();
      }
    } catch (e) {
      console.warn('Failed to load gallery database, initializing with seed data', e);
      this.categories = [...SEED_CATEGORIES];
      this.images = [...SEED_IMAGES];
    }
  }

  save() {
    try {
      const payload = {
        version: 1,
        updatedAt: new Date().toISOString(),
        categories: this.categories,
        images: this.images
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save gallery database to disk', e);
    }
  }

  // ── Authentication & Rate Limiting ─────────────────────────────────────────
  checkRateLimit(ip) {
    const entry = this.failedAttempts.get(ip);
    if (!entry) return { allowed: true };

    const now = Date.now();
    if (entry.lockedUntil && entry.lockedUntil > now) {
      const waitSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }

    if (entry.lockedUntil && entry.lockedUntil <= now) {
      this.failedAttempts.delete(ip);
      return { allowed: true };
    }

    return { allowed: true };
  }

  recordFailedLogin(ip) {
    const now = Date.now();
    const entry = this.failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    entry.count += 1;

    if (entry.count >= 5) {
      entry.lockedUntil = now + (15 * 60 * 1000); // 15 min lock
    }
    this.failedAttempts.set(ip, entry);
  }

  resetFailedAttempts(ip) {
    this.failedAttempts.delete(ip);
  }

  createAdminSession() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    this.sessions.set(token, { expiresAt, createdAt: Date.now() });
    return { token, expiresAt };
  }

  validateAdminSession(token) {
    if (!token) return false;
    const session = this.sessions.get(token);
    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return false;
    }
    return true;
  }

  revokeAdminSession(token) {
    if (token) {
      this.sessions.delete(token);
    }
  }

  // ── Category Management ───────────────────────────────────────────────────
  slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getCategories({ isPublic = false } = {}) {
    let list = this.categories;
    if (isPublic) {
      list = list.filter(c => c.isPublished);
    }

    // Attach image counts
    return list
      .map(cat => {
        const count = this.images.filter(img => img.categoryId === cat.id && (!isPublic || img.isPublished)).length;
        return { ...cat, imagesCount: count };
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  getCategoryBySlug(slug, { isPublic = false } = {}) {
    const cleanSlug = this.slugify(slug);
    const cat = this.categories.find(c => c.slug === cleanSlug);
    if (!cat) return null;
    if (isPublic && !cat.isPublished) return null;

    const count = this.images.filter(img => img.categoryId === cat.id && (!isPublic || img.isPublished)).length;
    return { ...cat, imagesCount: count };
  }

  getCategoryById(id) {
    return this.categories.find(c => c.id === id) || null;
  }

  createCategory({ name, slug, description, coverImageUrl, isPublished = true }) {
    if (!name || !name.trim()) throw new Error('Category name is required');

    let finalSlug = this.slugify(slug || name);
    // Ensure slug uniqueness
    if (this.categories.some(c => c.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const newCat = {
      id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      slug: finalSlug,
      description: description ? description.trim() : '',
      coverImageUrl: coverImageUrl ? coverImageUrl.trim() : null,
      isPublished: Boolean(isPublished),
      displayOrder: this.categories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id, updates = {}) {
    const cat = this.getCategoryById(id);
    if (!cat) return null;

    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.slug !== undefined) {
      const newSlug = this.slugify(updates.slug);
      if (newSlug && !this.categories.some(c => c.slug === newSlug && c.id !== id)) {
        cat.slug = newSlug;
      }
    }
    if (updates.description !== undefined) cat.description = updates.description.trim();
    if (updates.coverImageUrl !== undefined) cat.coverImageUrl = updates.coverImageUrl ? updates.coverImageUrl.trim() : null;
    if (updates.isPublished !== undefined) cat.isPublished = Boolean(updates.isPublished);
    if (updates.displayOrder !== undefined) cat.displayOrder = Number(updates.displayOrder) || 0;

    cat.updatedAt = new Date().toISOString();
    this.save();
    return cat;
  }

  deleteCategory(id) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;

    // Delete associated images or unlink them
    const associatedImages = this.images.filter(img => img.categoryId === id);
    for (const img of associatedImages) {
      this.deleteImage(img.id);
    }

    this.categories.splice(idx, 1);
    this.save();
    return true;
  }

  reorderCategories(orderedIds = []) {
    orderedIds.forEach((id, index) => {
      const cat = this.categories.find(c => c.id === id);
      if (cat) cat.displayOrder = index + 1;
    });
    this.save();
    return this.getCategories();
  }

  // ── Image Management ───────────────────────────────────────────────────────
  getImages({ categoryId, categorySlug, isPublished, sourceType, search, isPublic = false } = {}) {
    let list = [...this.images];

    if (categorySlug) {
      const cat = this.getCategoryBySlug(categorySlug, { isPublic });
      if (!cat) return [];
      list = list.filter(img => img.categoryId === cat.id);
    } else if (categoryId) {
      list = list.filter(img => img.categoryId === categoryId);
    }

    if (isPublic) {
      list = list.filter(img => img.isPublished);
    } else if (isPublished !== undefined) {
      list = list.filter(img => img.isPublished === Boolean(isPublished));
    }

    if (sourceType) {
      list = list.filter(img => img.sourceType === sourceType);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(img =>
        (img.title && img.title.toLowerCase().includes(q)) ||
        (img.description && img.description.toLowerCase().includes(q))
      );
    }

    // Attach category name for ease of use
    const catMap = new Map(this.categories.map(c => [c.id, c.name]));

    return list
      .map(img => ({
        ...img,
        categoryName: catMap.get(img.categoryId) || 'Uncategorized'
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  getImageById(id) {
    return this.images.find(img => img.id === id) || null;
  }

  createImage({
    categoryId,
    title,
    description,
    sourceType = 'upload',
    imageUrl,
    storageUrl = null,
    thumbnailUrl = null,
    isPublished = true,
    displayOrder = null
  }) {
    if (!imageUrl) throw new Error('imageUrl is required');
    if (!categoryId) throw new Error('categoryId is required');

    const newImage = {
      id: `img-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      categoryId,
      title: title ? title.trim() : 'Untitled Image',
      description: description ? description.trim() : '',
      sourceType: sourceType === 'upload' ? 'upload' : 'external-url',
      imageUrl: imageUrl.trim(),
      storageUrl: storageUrl ? storageUrl.trim() : null,
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : imageUrl.trim(),
      isPublished: Boolean(isPublished),
      displayOrder: displayOrder !== null ? Number(displayOrder) : this.images.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.images.push(newImage);
    this.save();
    return newImage;
  }

  createBulkImages(items = []) {
    const created = [];
    for (const item of items) {
      if (item.imageUrl && item.categoryId) {
        created.push(this.createImage(item));
      }
    }
    return created;
  }

  updateImage(id, updates = {}) {
    const img = this.getImageById(id);
    if (!img) return null;

    if (updates.categoryId !== undefined) img.categoryId = updates.categoryId;
    if (updates.title !== undefined) img.title = updates.title.trim();
    if (updates.description !== undefined) img.description = updates.description.trim();
    if (updates.imageUrl !== undefined) img.imageUrl = updates.imageUrl.trim();
    if (updates.thumbnailUrl !== undefined) img.thumbnailUrl = updates.thumbnailUrl.trim();
    if (updates.isPublished !== undefined) img.isPublished = Boolean(updates.isPublished);
    if (updates.displayOrder !== undefined) img.displayOrder = Number(updates.displayOrder) || 0;

    img.updatedAt = new Date().toISOString();
    this.save();
    return img;
  }

  deleteImage(id) {
    const idx = this.images.findIndex(img => img.id === id);
    if (idx === -1) return false;

    const img = this.images[idx];

    // If local uploaded file, remove from disk
    if (img.storageUrl && img.sourceType === 'upload') {
      try {
        const localPath = path.resolve(UPLOADS_DIR, path.basename(img.storageUrl));
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (err) {
        console.warn('Could not remove file asset:', err);
      }
    }

    this.images.splice(idx, 1);
    this.save();
    return true;
  }

  reorderImages(orderedIds = []) {
    orderedIds.forEach((id, index) => {
      const img = this.images.find(i => i.id === id);
      if (img) img.displayOrder = index + 1;
    });
    this.save();
    return this.getImages();
  }

  getDashboardStats() {
    const totalCategories = this.categories.length;
    const totalImages = this.images.length;
    const publishedImages = this.images.filter(i => i.isPublished).length;
    const externalImages = this.images.filter(i => i.sourceType === 'external-url').length;
    const uploadedImages = this.images.filter(i => i.sourceType === 'upload').length;
    const recentUploads = [...this.images]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      totalCategories,
      totalImages,
      publishedImages,
      externalImages,
      uploadedImages,
      recentUploads
    };
  }
}

export const galleryDB = new GalleryDatabase();
