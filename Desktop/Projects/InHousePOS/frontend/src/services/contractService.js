import axios from 'axios';

// frontend/src/services/contractService.js
const API_URL = '/api/contracts';

const contractService = {
  create: async (projectId, contractData) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}`, contractData);
      return response.data;
    } catch (error) {
      console.error('Create contract error:', error);
      throw error.response?.data?.message || 'Failed to create contract';
    }
  },

  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Get contracts error:', error);
      throw error.response?.data?.message || 'Failed to fetch contracts';
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get contract error:', error);
      throw error.response?.data?.message || 'Failed to fetch contract';
    }
  },

  update: async (id, contractData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, contractData);
      return response.data;
    } catch (error) {
      console.error('Update contract error:', error);
      throw error.response?.data?.message || 'Failed to update contract';
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete contract error:', error);
      throw error.response?.data?.message || 'Failed to delete contract';
    }
  },

  getPDF: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/pdf`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Get contract PDF error:', error);
      throw error.response?.data?.message || 'Failed to fetch contract PDF';
    }
  },

  sendEmail: async (id, recipientEmail) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/email`, { recipientEmail });
      return response.data;
    } catch (error) {
      console.error('Send contract email error:', error);
      throw error.response?.data?.message || 'Failed to send contract email';
    }
  },

  approve: async (id) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve contract error:', error);
      throw error.response?.data?.message || 'Failed to approve contract';
    }
  },

  reject: async (id, reason) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject contract error:', error);
      throw error.response?.data?.message || 'Failed to reject contract';
    }
  },

  getHistory: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Get contract history error:', error);
      throw error.response?.data?.message || 'Failed to fetch contract history';
    }
  }
};

export default contractService;