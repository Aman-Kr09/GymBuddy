import express from 'express';
import {
  getConversations, getMessages, createConversation, sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations', createConversation);
router.post('/conversations/:id/messages', sendMessage);

export default router;
