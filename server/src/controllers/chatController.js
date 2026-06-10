import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * @desc    Get user conversations
 * @route   GET /api/chat/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
    .populate('participants', 'fullName avatar')
    .populate('lastMessage.sender', 'fullName')
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/chat/conversations/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Verify user is participant
    if (!conversation.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create conversation or get existing
 * @route   POST /api/chat/conversations
 */
export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Participant ID required' });
    }

    // Check if conversation exists
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    }).populate('participants', 'fullName avatar');

    if (existing) {
      return res.status(200).json({ success: true, conversation: existing });
    }

    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName avatar');

    res.status(201).json({ success: true, conversation: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send message via REST (fallback for Socket.io)
 * @route   POST /api/chat/conversations/:id/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
    });

    // Update last message
    conversation.lastMessage = {
      text,
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
