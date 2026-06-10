import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 100,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    locality: { type: String, default: '' },
  },
  fitnessGoals: [{
    type: String,
    enum: [
      'Weight Loss', 'Muscle Gain', 'Strength Training', 'Bodybuilding',
      'Powerlifting', 'Fat Loss', 'General Fitness', 'Cardio', 'CrossFit', 'Yoga'
    ],
  }],
  interests: [{
    type: String,
    enum: [
      'Morning Workout', 'Evening Workout', 'Home Workout',
      'Gym Workout', 'Running', 'Cycling', 'Diet Planning'
    ],
  }],
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  preferredWorkoutTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'morning',
  },
  preferredGym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  },
  genderPreference: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any',
  },
  role: {
    type: String,
    enum: ['user', 'gymOwner', 'admin'],
    default: 'user',
  },
  savedGyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  friendRequests: {
    sent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    received: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  badges: [String],
  resetOtp: {
    code: String,
    expiresAt: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Geospatial index for location-based queries
userSchema.index({ 'location': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetOtp;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
