import User from '../models/User.js';
import { getMLBuddyRecommendations } from '../services/mlService.js';

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'gender', 'age', 'mobile', 'avatar',
      'fitnessGoals', 'interests', 'experienceLevel',
      'preferredWorkoutTime', 'preferredGym', 'genderPreference'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user location
 * @route   PUT /api/users/location
 */
export const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, city, state, locality } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        city: city || '',
        state: state || '',
        locality: locality || '',
      }
    }, { new: true });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get recommended buddies (geospatial + preference matching)
 * @route   GET /api/users/buddies
 */
export const getBuddies = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const { maxDistance = 10000, goal, time, page = 1, limit = 20 } = req.query;

    // Build match filter
    const matchFilter = {
      _id: { $ne: currentUser._id },
      role: 'user',
    };

    if (goal) matchFilter.fitnessGoals = goal;
    if (time) matchFilter.preferredWorkoutTime = time;

    // Gender preference filter
    if (currentUser.genderPreference !== 'any') {
      matchFilter.gender = currentUser.genderPreference;
    }

    let buddies;

    // If user has location, use geospatial query
    if (currentUser.location?.coordinates?.[0] !== 0 || currentUser.location?.coordinates?.[1] !== 0) {
      buddies = await User.find({
        ...matchFilter,
        'location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: currentUser.location.coordinates,
            },
            $maxDistance: parseInt(maxDistance),
          }
        }
      })
      .select('-password -resetOtp')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    } else {
      buddies = await User.find(matchFilter)
        .select('-password -resetOtp')
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
    }

    // Try Python ML service first
    const mlRecs = await getMLBuddyRecommendations(currentUser, buddies);
    if (mlRecs) {
      const recMap = new Map(mlRecs.map(r => [r.id, r]));
      const buddiesWithScores = buddies
        .map(buddy => {
          const rec = recMap.get(buddy._id.toString());
          if (rec) {
            return {
              ...buddy.toObject(),
              compatibility: rec.compatibility,
              distance: rec.distance
            };
          }
          return null;
        })
        .filter(Boolean);

      // Sort by compatibility
      buddiesWithScores.sort((a, b) => b.compatibility - a.compatibility);

      return res.status(200).json({
        success: true,
        count: buddiesWithScores.length,
        buddies: buddiesWithScores,
        source: 'ml-service'
      });
    }

    // Fallback scoring in Node.js
    const buddiesWithScores = buddies.map(buddy => {
      const score = calculateCompatibility(currentUser, buddy);
      const dist = calculateDistance(
        currentUser.location?.coordinates,
        buddy.location?.coordinates
      );
      return {
        ...buddy.toObject(),
        compatibility: score,
        distance: dist,
      };
    });

    // Sort by compatibility
    buddiesWithScores.sort((a, b) => b.compatibility - a.compatibility);

    res.status(200).json({
      success: true,
      count: buddiesWithScores.length,
      buddies: buddiesWithScores,
      source: 'node-fallback'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send friend request
 * @route   POST /api/users/friend-request/:id
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (targetId === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already friends
    if (req.user.friends.includes(targetId)) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    // Check if request already sent
    if (req.user.friendRequests.sent.includes(targetId)) {
      return res.status(400).json({ success: false, message: 'Request already sent' });
    }

    // Add to sent requests
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'friendRequests.sent': targetId }
    });

    // Add to received requests
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { 'friendRequests.received': userId }
    });

    res.status(200).json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Accept friend request
 * @route   PUT /api/users/friend-request/:id/accept
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.id;
    const userId = req.user._id;

    // Verify the request exists
    if (!req.user.friendRequests.received.map(id => id.toString()).includes(senderId)) {
      return res.status(400).json({ success: false, message: 'No request from this user' });
    }

    // Add as friends for both users
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: senderId },
      $pull: { 'friendRequests.received': senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: userId },
      $pull: { 'friendRequests.sent': userId }
    });

    res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Reject friend request
 * @route   PUT /api/users/friend-request/:id/reject
 */
export const rejectFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.id;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { 'friendRequests.received': senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $pull: { 'friendRequests.sent': userId }
    });

    res.status(200).json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get friends list
 * @route   GET /api/users/friends
 */
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'fullName avatar fitnessGoals location preferredWorkoutTime experienceLevel');

    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get saved gyms
 * @route   GET /api/users/saved-gyms
 */
export const getSavedGyms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedGyms', 'name photos location ratings membershipPlans facilities');

    res.status(200).json({ success: true, savedGyms: user.savedGyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle save/unsave gym
 * @route   POST /api/users/saved-gyms/:gymId
 */
export const toggleSaveGym = async (req, res) => {
  try {
    const gymId = req.params.gymId;
    const user = await User.findById(req.user._id);

    const isSaved = user.savedGyms.includes(gymId);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedGyms: gymId }
      });
      res.status(200).json({ success: true, saved: false, message: 'Gym removed from saved' });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { savedGyms: gymId }
      });
      res.status(200).json({ success: true, saved: true, message: 'Gym saved' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get friend requests (sent + received)
 * @route   GET /api/users/friend-requests
 */
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.sent', 'fullName avatar fitnessGoals')
      .populate('friendRequests.received', 'fullName avatar fitnessGoals');

    res.status(200).json({
      success: true,
      sent: user.friendRequests.sent,
      received: user.friendRequests.received,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── Helper Functions ───

function calculateCompatibility(user1, user2) {
  let score = 0;
  let maxScore = 0;

  // Goal similarity (weight: 35)
  maxScore += 35;
  const commonGoals = user1.fitnessGoals.filter(g => user2.fitnessGoals.includes(g));
  if (user1.fitnessGoals.length > 0 && user2.fitnessGoals.length > 0) {
    score += (commonGoals.length / Math.max(user1.fitnessGoals.length, user2.fitnessGoals.length)) * 35;
  }

  // Interest similarity (weight: 20)
  maxScore += 20;
  const commonInterests = (user1.interests || []).filter(i => (user2.interests || []).includes(i));
  const maxInterests = Math.max((user1.interests || []).length, (user2.interests || []).length);
  if (maxInterests > 0) {
    score += (commonInterests.length / maxInterests) * 20;
  }

  // Workout time match (weight: 20)
  maxScore += 20;
  if (user1.preferredWorkoutTime === user2.preferredWorkoutTime) {
    score += 20;
  }

  // Experience level proximity (weight: 10)
  maxScore += 10;
  const levels = { beginner: 0, intermediate: 1, advanced: 2 };
  const levelDiff = Math.abs((levels[user1.experienceLevel] || 0) - (levels[user2.experienceLevel] || 0));
  score += (1 - levelDiff / 2) * 10;

  // Age proximity (weight: 10)
  maxScore += 10;
  const ageDiff = Math.abs((user1.age || 25) - (user2.age || 25));
  score += Math.max(0, (1 - ageDiff / 20)) * 10;

  // Same gym preference (weight: 5)
  maxScore += 5;
  if (user1.preferredGym && user2.preferredGym &&
      user1.preferredGym.toString() === user2.preferredGym.toString()) {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}

function calculateDistance(coords1, coords2) {
  if (!coords1 || !coords2 || (coords1[0] === 0 && coords1[1] === 0)) {
    return 'N/A';
  }

  const R = 6371; // Earth radius in km
  const dLat = (coords2[1] - coords1[1]) * Math.PI / 180;
  const dLon = (coords2[0] - coords1[0]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1[1] * Math.PI / 180) * Math.cos(coords2[1] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}
