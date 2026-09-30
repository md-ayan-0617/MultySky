import express from 'express';
import * as mediaCtrl from '../controllers/mediaController.js';

const router = express.Router();

router.get('/', mediaCtrl.getMedia);
router.post('/upload', mediaCtrl.upload.single('file'), mediaCtrl.uploadMedia);
router.delete('/:id', mediaCtrl.deleteMedia);

export default router;
