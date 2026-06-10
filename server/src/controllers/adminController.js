import User from '../models/User.js';
import Gym from '../models/Gym.js';
import Review from '../models/Review.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalGyms, totalReviews, verifiedGyms] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Gym.countDocuments(),
      Review.countDocuments(),
      Gym.countDocuments({ isVerified: true }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt role');

    const recentGyms = await Gym.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name location.city isVerified createdAt');

    const gymOwners = await User.countDocuments({ role: 'gymOwner' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalGyms,
        totalReviews,
        verifiedGyms,
        gymOwners,
      },
      recentUsers,
      recentGyms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(filter)
      .select('-password -resetOtp')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all gyms (admin view)
 * @route   GET /api/admin/gyms
 */
export const getAllGyms = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified, search } = req.query;
    const filter = {};

    if (verified === 'true') filter.isVerified = true;
    if (verified === 'false') filter.isVerified = false;
    if (search) filter.name = new RegExp(search, 'i');

    const gyms = await Gym.find(filter)
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 })
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
 * @desc    Verify/unverify gym
 * @route   PUT /api/admin/gyms/:id/verify
 */
export const verifyGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    gym.isVerified = !gym.isVerified;
    await gym.save();

    res.status(200).json({
      success: true,
      message: `Gym ${gym.isVerified ? 'verified' : 'unverified'} successfully`,
      gym,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete user (admin)
 * @route   DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete gym (admin)
 * @route   DELETE /api/admin/gyms/:id
 */
export const deleteGym = async (req, res) => {
  try {
    await Gym.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ gym: req.params.id });

    res.status(200).json({ success: true, message: 'Gym and reviews deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user role (admin)
 * @route   PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'gymOwner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
