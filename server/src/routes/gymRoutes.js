import express from 'express';
import {
  getNearbyGyms, searchGyms, getGymById, createGym, updateGym,
  addReview, getReviews, getRecommendedGyms, deleteGym,
} from '../controllers/gymController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyGyms);
router.get('/search', searchGyms);
router.get('/:id/reviews', getReviews);
router.get('/:id', getGymById);

// Protected routes
router.get('/recommended', protect, getRecommendedGyms);
router.post('/', protect, createGym);
router.put('/:id', protect, updateGym);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id', protect, deleteGym);

export default router;
