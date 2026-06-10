import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOtp, sendOtpEmail } from '../utils/email.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, gender, age, mobile, fitnessGoals, interests, location } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      gender,
      age,
      mobile,
      fitnessGoals: fitnessGoals || [],
      interests: interests || [],
      location: location || { type: 'Point', coordinates: [0, 0] },
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Forgot password - send OTP
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = generateOtp();
    user.resetOtp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
    await user.save({ validateBeforeSave: false });

    const sent = await sendOtpEmail(email, otp);
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetOtp || !user.resetOtp.code) {
      return res.status(400).json({ success: false, message: 'No OTP requested' });
    }

    if (user.resetOtp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (user.resetOtp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetOtp || user.resetOtp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedGyms', 'name photos location ratings')
      .populate('friends', 'fullName avatar fitnessGoals');

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
