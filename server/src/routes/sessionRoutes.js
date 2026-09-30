import express from 'express';
import * as sessionCtrl from '../controllers/sessionController.js';
import * as deviceCtrl from '../controllers/deviceController.js';

const router = express.Router();

router.post('/create', sessionCtrl.createSession);
router.post('/join', sessionCtrl.joinSession);
router.get('/:id', sessionCtrl.getSessionById);
router.put('/:id/layout', sessionCtrl.updateLayout);
router.post('/:id/end', sessionCtrl.endSession);

// Device routes on session
router.post('/:id/device', deviceCtrl.registerDevice);
router.put('/:id/device/position', deviceCtrl.updateDevicePosition);
router.delete('/:id/device/:deviceId', deviceCtrl.removeDevice);

export default router;
