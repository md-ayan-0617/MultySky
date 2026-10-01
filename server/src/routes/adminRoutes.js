import { Router } from 'express';
import { galleryDB } from '../services/galleryService.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '9827988375';

// POST /api/admin/login
router.post('/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const { password } = req.body || {};

  const rateCheck = galleryDB.checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Please try again in ${rateCheck.waitSeconds} seconds.`
    });
  }

  if (!password || typeof password !== 'string' || password.trim() !== ADMIN_PASSWORD) {
    galleryDB.recordFailedLogin(ip);
    return res.status(401).json({
      success: false,
      message: 'Invalid administrator credentials'
    });
  }

  galleryDB.resetFailedAttempts(ip);
  const session = galleryDB.createAdminSession();

  return res.json({
    success: true,
    message: 'Admin authentication successful',
    token: session.token,
    expiresAt: session.expiresAt
  });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.headers['x-admin-token'];
  if (token) {
    galleryDB.revokeAdminSession(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/me
router.get('/me', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    user: {
      role: 'admin',
      permissions: ['all']
    }
  });
});

// GET /api/admin/stats
router.get('/stats', requireAdminAuth, (req, res) => {
  const stats = galleryDB.getDashboardStats();
  return res.json({
    success: true,
    stats
  });
});

export default router;
