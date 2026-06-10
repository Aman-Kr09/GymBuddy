import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5, default: 3 },
    trainers: { type: Number, min: 1, max: 5, default: 3 },
    cleanliness: { type: Number, min: 1, max: 5, default: 3 },
    environment: { type: Number, min: 1, max: 5, default: 3 },
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: 1000,
  },
  photos: [String],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// One review per user per gym
reviewSchema.index({ gym: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
