import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as mediaService from '../services/mediaService.js';
import * as sessionService from '../services/sessionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

export const getMedia = (req, res) => {
  try {
    const list = mediaService.getMediaList();
    return res.json({ success: true, media: list });
  } catch (error) {
    console.error('Error getting media:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMedia = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    const isImage = req.file.mimetype.startsWith('image');

    const host = req.get('host') || 'localhost:3001';
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const mediaItem = {
      id: `uploaded-${Date.now()}`,
      name: req.body.name || req.file.originalname,
      type: isVideo ? 'video' : 'image',
      category: 'User Uploads',
      url: fileUrl,
      thumbnail: isImage ? fileUrl : 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=400&auto=format&fit=crop&q=80',
      size: req.file.size,
      filePath: req.file.path,
      createdAt: new Date().toISOString()
    };

    mediaService.addUploadedMedia(mediaItem);

    // If sessionId is provided, set as current media for the session automatically
    if (req.body.sessionId) {
      const session = sessionService.getSession(req.body.sessionId);
      if (session) {
        session.media = mediaItem;
        session.playback.currentTime = 0;
      }
    }

    return res.status(201).json({ success: true, media: mediaItem });
  } catch (error) {
    console.error('Error uploading media:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedia = (req, res) => {
  try {
    const { id } = req.params;
    const success = mediaService.deleteUploadedMedia(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    return res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
