import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Automatically attach the JWT token to every request if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Reusable API Methods ──────────────────────────────────────────────────────

export const storyService = {
  // Fetch paginated and sorted stories
  getStories: async (page = 1, limit = 20) => {
    const response = await api.get(`/stories?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Fetch a single story by ID
  getStoryById: async (id) => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
  },

  // Toggle bookmark (add/remove) for a story
  toggleBookmark: async (id) => {
    const response = await api.post(`/stories/${id}/bookmark`);
    return response.data;
  },

  // Fetch all bookmarked stories for logged-in user
  getBookmarkedStories: async () => {
    const response = await api.get('/stories/bookmarks');
    return response.data;
  },
};

export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login existing user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export default api;
