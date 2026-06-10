import express from 'express';
import {
  updateProfile, updateLocation, getBuddies, sendFriendRequest,
  acceptFriendRequest, rejectFriendRequest, getFriends,
  getSavedGyms, toggleSaveGym, getFriendRequests,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All user routes require auth

router.put('/profile', updateProfile);
router.put('/location', updateLocation);
router.get('/buddies', getBuddies);
router.get('/friends', getFriends);
router.get('/friend-requests', getFriendRequests);
router.post('/friend-request/:id', sendFriendRequest);
router.put('/friend-request/:id/accept', acceptFriendRequest);
router.put('/friend-request/:id/reject', rejectFriendRequest);
router.get('/saved-gyms', getSavedGyms);
router.post('/saved-gyms/:gymId', toggleSaveGym);

export default router;
