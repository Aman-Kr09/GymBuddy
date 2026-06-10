import express from 'express';
import { createSession, getSessions, updateSessionStatus } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createSession);
router.get('/', getSessions);
router.put('/:id', updateSessionStatus);

export default router;
