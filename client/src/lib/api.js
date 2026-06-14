import axios from 'axios';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gymbuddy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gymbuddy_token');
      localStorage.removeItem('gymbuddy_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

// Gym API
export const gymAPI = {
  getNearby: (params) => api.get('/gyms/nearby', { params }),
  getById: (id) => api.get(`/gyms/${id}`),
  search: (params) => api.get('/gyms/search', { params }),
  getRecommended: () => api.get('/gyms/recommended'),
  create: (data) => api.post('/gyms', data),
  update: (id, data) => api.put(`/gyms/${id}`, data),
  addReview: (id, data) => api.post(`/gyms/${id}/reviews`, data),
  getReviews: (id) => api.get(`/gyms/${id}/reviews`),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateLocation: (data) => api.put('/users/location', data),
  getBuddies: (params) => api.get('/users/buddies', { params }),
  sendFriendRequest: (id) => api.post(`/users/friend-request/${id}`),
  acceptFriendRequest: (id) => api.put(`/users/friend-request/${id}/accept`),
  rejectFriendRequest: (id) => api.put(`/users/friend-request/${id}/reject`),
  getFriends: () => api.get('/users/friends'),
  getFriendRequests: () => api.get('/users/friend-requests'),
  getSavedGyms: () => api.get('/users/saved-gyms'),
  toggleSaveGym: (gymId) => api.post(`/users/saved-gyms/${gymId}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (id) => api.get(`/chat/conversations/${id}/messages`),
  createConversation: (data) => api.post('/chat/conversations', data),
};

// Session API
export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  getAll: () => api.get('/sessions'),
  updateStatus: (id, status) => api.put(`/sessions/${id}`, { status }),
};
