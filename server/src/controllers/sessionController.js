import WorkoutSession from '../models/WorkoutSession.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';

/**
 * @desc    Create a workout session
 * @route   POST /api/sessions
 */
export const createSession = async (req, res) => {
  try {
    const { buddyId, gymId, date, time, type } = req.body;

    if (!buddyId || !gymId || !date || !time || !type) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const session = await WorkoutSession.create({
      organizer: req.user._id,
      participants: [req.user._id, buddyId],
      gym: gymId,
      date,
      time,
      type,
      status: 'scheduled'
    });

    const populated = await WorkoutSession.findById(session._id)
      .populate('organizer', 'fullName avatar')
      .populate('participants', 'fullName avatar')
      .populate('gym', 'name location');

    res.status(201).json({ success: true, session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's workout sessions
 * @route   GET /api/sessions
 */
export const getSessions = async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({
      participants: req.user._id
    })
    .populate('organizer', 'fullName avatar')
    .populate('participants', 'fullName avatar')
    .populate('gym', 'name location')
    .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update session status
 * @route   PUT /api/sessions/:id
 */
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const session = await WorkoutSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Verify user is participant
    if (!session.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.status = status;
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
