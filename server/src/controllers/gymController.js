import Gym from '../models/Gym.js';
import Review from '../models/Review.js';
import { getMLGymRecommendations } from '../services/mlService.js';

/**
 * @desc    Get nearby gyms (geospatial query)
 * @route   GET /api/gyms/nearby
 */
export const getNearbyGyms = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, limit = 20, page = 1 } = req.query;

    if (!longitude || !latitude) {
      // Fallback: return all active gyms
      const gyms = await Gym.find({ isActive: true })
        .sort({ 'ratings.overall': -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      return res.status(200).json({ success: true, count: gyms.length, gyms });
    }

    const gyms = await Gym.find({
      isActive: true,
      'location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        }
      }
    })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({ success: true, count: gyms.length, gyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Search & filter gyms
 * @route   GET /api/gyms/search
 */
export const searchGyms = async (req, res) => {
  try {
    const {
      q, city, minRating, maxPrice, femaleFriendly,
      hasAC, hasParking, hasPersonalTrainer,
      sortBy = 'ratings.overall', page = 1, limit = 20
    } = req.query;

    const filter = { isActive: true };

    if (q) filter.$text = { $search: q };
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minRating) filter['ratings.overall'] = { $gte: parseFloat(minRating) };
    if (femaleFriendly === 'true') filter.femaleFriendly = true;
    if (hasAC === 'true') filter.hasAC = true;
    if (hasParking === 'true') filter.hasParking = true;
    if (hasPersonalTrainer === 'true') filter.hasPersonalTrainer = true;

    // Price filter on first membership plan
    if (maxPrice) {
      filter['membershipPlans.0.price'] = { $lte: parseInt(maxPrice) };
    }

    const sortOptions = {};
    if (sortBy === 'price') sortOptions['membershipPlans.0.price'] = 1;
    else if (sortBy === 'rating') sortOptions['ratings.overall'] = -1;
    else if (sortBy === 'popularity') sortOptions['popularity'] = -1;
    else sortOptions['ratings.overall'] = -1;

    const gyms = await Gym.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Gym.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: gyms.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      gyms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get gym by ID
 * @route   GET /api/gyms/:id
 */
export const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate('owner', 'fullName email');

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    // Increment popularity
    gym.popularity += 1;
    await gym.save();

    res.status(200).json({ success: true, gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Register new gym (gym owner)
 * @route   POST /api/gyms
 */
export const createGym = async (req, res) => {
  try {
    const gym = await Gym.create({
      ...req.body,
      owner: req.user._id,
    });

    // Update user role to gymOwner if not already
    if (req.user.role === 'user') {
      req.user.role = 'gymOwner';
      await req.user.save({ validateBeforeSave: false });
    }

    res.status(201).json({ success: true, gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update gym
 * @route   PUT /api/gyms/:id
 */
export const updateGym = async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    // Check ownership
    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    gym = await Gym.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add review to gym
 * @route   POST /api/gyms/:id/reviews
 */
export const addReview = async (req, res) => {
  try {
    const gymId = req.params.id;

    // Check if already reviewed
    const existing = await Review.findOne({ gym: gymId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this gym' });
    }

    const review = await Review.create({
      gym: gymId,
      user: req.user._id,
      ...req.body,
    });

    // Update gym ratings
    const allReviews = await Review.find({ gym: gymId });
    const avgRatings = {
      overall: 0, facilities: 0, trainers: 0, cleanliness: 0, environment: 0,
    };

    allReviews.forEach(r => {
      avgRatings.overall += r.rating.overall;
      avgRatings.facilities += r.rating.facilities;
      avgRatings.trainers += r.rating.trainers;
      avgRatings.cleanliness += r.rating.cleanliness;
      avgRatings.environment += r.rating.environment;
    });

    const count = allReviews.length;
    await Gym.findByIdAndUpdate(gymId, {
      ratings: {
        overall: parseFloat((avgRatings.overall / count).toFixed(1)),
        facilities: parseFloat((avgRatings.facilities / count).toFixed(1)),
        trainers: parseFloat((avgRatings.trainers / count).toFixed(1)),
        cleanliness: parseFloat((avgRatings.cleanliness / count).toFixed(1)),
        environment: parseFloat((avgRatings.environment / count).toFixed(1)),
        totalReviews: count,
      },
      environmentScore: parseFloat((avgRatings.environment / count).toFixed(1)),
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get gym reviews
 * @route   GET /api/gyms/:id/reviews
 */
export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ gym: req.params.id })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ gym: req.params.id });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get AI recommended gyms
 * @route   GET /api/gyms/recommended
 */
export const getRecommendedGyms = async (req, res) => {
  try {
    const user = await (await import('../models/User.js')).default.findById(req.user._id);
    const gyms = await Gym.find({ isActive: true }).limit(50);

    // Try Python ML microservice first
    const mlRecs = await getMLGymRecommendations(user, gyms);
    if (mlRecs) {
      // Map recommendations back to full gym objects
      const gymMap = new Map(gyms.map(g => [g._id.toString(), g]));
      const recommendedGyms = mlRecs
        .map(rec => {
          const gymObj = gymMap.get(rec.id);
          if (gymObj) {
            return {
              ...gymObj.toObject(),
              recommendationScore: rec.recommendationScore
            };
          }
          return null;
        })
        .filter(Boolean);

      return res.status(200).json({
        success: true,
        gyms: recommendedGyms.slice(0, 10),
        source: 'ml-service'
      });
    }

    // Score-based fallback recommendation in Node.js
    const scored = gyms.map(gym => {
      let score = 0;

      // Rating weight (30%)
      score += (gym.ratings.overall / 5) * 30;

      // Popularity weight (15%)
      score += Math.min(gym.popularity / 100, 1) * 15;

      // Facilities match weight (25%)
      const userGoals = user.fitnessGoals || [];
      const goalFacilityMap = {
        'Yoga': ['Yoga Studio'],
        'CrossFit': ['CrossFit Zone'],
        'Cardio': ['Cardio Equipment'],
        'Strength Training': ['Strength Equipment'],
        'Bodybuilding': ['Strength Equipment', 'Personal Trainer'],
        'Powerlifting': ['Strength Equipment'],
      };
      let facilityMatch = 0;
      userGoals.forEach(goal => {
        const needed = goalFacilityMap[goal] || [];
        needed.forEach(f => {
          if (gym.facilities.includes(f)) facilityMatch++;
        });
      });
      score += Math.min(facilityMatch / 3, 1) * 25;

      // Price match weight (15%) - prefer affordable
      const price = gym.membershipPlans[0]?.price || 5000;
      score += Math.max(0, (1 - price / 5000)) * 15;

      // Distance weight (15%) - if location available
      if (user.location?.coordinates?.[0] && gym.location?.coordinates?.[0]) {
        const dist = haversine(user.location.coordinates, gym.location.coordinates);
        score += Math.max(0, (1 - dist / 10)) * 15;
      }

      return { ...gym.toObject(), recommendationScore: Math.round(score) };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.status(200).json({
      success: true,
      gyms: scored.slice(0, 10),
      source: 'node-fallback'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete gym (admin only)
 * @route   DELETE /api/gyms/:id
 */
export const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Gym.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ gym: req.params.id });

    res.status(200).json({ success: true, message: 'Gym deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Haversine distance helper
function haversine(coords1, coords2) {
  const R = 6371;
  const dLat = (coords2[1] - coords1[1]) * Math.PI / 180;
  const dLon = (coords2[0] - coords1[0]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(coords1[1] * Math.PI / 180) * Math.cos(coords2[1] * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
