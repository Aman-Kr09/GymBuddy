import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Online users map: userId -> socketId
const onlineUsers = new Map();

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User connected: ${userId}`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));

    // Join personal room
    socket.join(userId);

    // ─── Send Message ───
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, text } = data;

        // Save message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          readBy: [userId],
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { text, sender: userId, createdAt: new Date() },
          updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'fullName avatar');

        // Get conversation participants
        const conversation = await Conversation.findById(conversationId);

        // Emit to all participants
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit('message:received', {
            message: populated,
            conversationId,
          });
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing indicator ───
    socket.on('typing:start', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('typing:start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing:stop', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // ─── Mark messages as read ───
    socket.on('messages:read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        // Notify other participants
        const conversation = await Conversation.findById(conversationId);
        conversation.participants.forEach(p => {
          if (p.toString() !== userId) {
            io.to(p.toString()).emit('messages:read', {
              conversationId,
              readBy: userId,
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    // ─── Disconnect ───
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  return io;
}
