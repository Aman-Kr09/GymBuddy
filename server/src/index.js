import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { setupSocket } from './sockets/socketHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = setupSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GymBuddy API is running 💪',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 GymBuddy Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.io ready`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
  });
};

startServer();

export { app, httpServer, io };
