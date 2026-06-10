import mongoose from 'mongoose';

const workoutSessionSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'General',
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
export default WorkoutSession;
