import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Gym name is required'],
    trim: true,
    maxlength: 100,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    maxlength: 2000,
    default: '',
  },
  photos: [String],
  videos: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
  },
  facilities: [{
    type: String,
    enum: [
      'AC', 'Parking', 'Personal Trainer', 'Cardio Equipment',
      'Strength Equipment', 'Swimming Pool', 'Sauna', 'Steam Room',
      'Locker Room', 'Shower', 'Wifi', 'Juice Bar', 'CrossFit Zone',
      'Yoga Studio', 'Boxing Ring', 'Group Classes'
    ],
  }],
  membershipPlans: [{
    name: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    features: [String],
  }],
  trainers: [{
    name: String,
    photo: String,
    specialization: String,
    experience: String,
  }],
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  femaleFriendly: { type: Boolean, default: false },
  hasAC: { type: Boolean, default: false },
  hasParking: { type: Boolean, default: false },
  hasPersonalTrainer: { type: Boolean, default: false },
  hasCardio: { type: Boolean, default: false },
  hasStrength: { type: Boolean, default: false },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  website: { type: String, default: '' },
  ratings: {
    overall: { type: Number, default: 0 },
    facilities: { type: Number, default: 0 },
    trainers: { type: Number, default: 0 },
    cleanliness: { type: Number, default: 0 },
    environment: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  environmentScore: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Geospatial index
gymSchema.index({ 'location': '2dsphere' });
// Text search index
gymSchema.index({ name: 'text', description: 'text' });

const Gym = mongoose.model('Gym', gymSchema);
export default Gym;
