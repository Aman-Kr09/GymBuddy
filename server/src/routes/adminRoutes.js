import express from 'express';
import {
  getStats, getAllUsers, getAllGyms, verifyGym,
  deleteUser, deleteGym, updateUserRole,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/gyms', getAllGyms);
router.put('/gyms/:id/verify', verifyGym);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.delete('/gyms/:id', deleteGym);

export default router;
