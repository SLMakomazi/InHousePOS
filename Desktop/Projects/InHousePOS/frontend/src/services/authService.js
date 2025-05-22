import axios from 'axios';

// frontend/src/services/authService.js
const API_URL = '/api/auth';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/verify`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.isValid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

export default authService;