import { galleryDB } from '../services/galleryService.js';

export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = tokenFromHeader || req.headers['x-admin-token'];

  if (!token || !galleryDB.validateAdminSession(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid admin session token required'
    });
  }

  req.adminToken = token;
  next();
}
