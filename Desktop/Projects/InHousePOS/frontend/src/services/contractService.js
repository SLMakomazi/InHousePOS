import api from './api';

// frontend/src/services/contractService.js
const API_URL = '/api/contracts';

const contractService = {
  // Get all contracts
  async getAll() {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Get contracts error:', error);
      throw error.response?.data?.message || 'Failed to fetch contracts';
    }
  },

  // Get single contract by ID
  async getById(id) {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get contract error:', error);
      throw error.response?.data?.message || 'Failed to fetch contract';
    }
  },

  // Create new contract
  async create(projectId, contractData) {
    try {
      const response = await api.post(`${API_URL}/${projectId}`, contractData);
      return response.data;
    } catch (error) {
      console.error('Create contract error:', error);
      throw error.response?.data?.message || 'Failed to create contract';
    }
  },

  // Update contract
  async update(id, contractData) {
    try {
      const response = await api.put(`${API_URL}/${id}`, contractData);
      return response.data;
    } catch (error) {
      console.error('Update contract error:', error);
      throw error.response?.data?.message || 'Failed to update contract';
    }
  },

  // Delete contract
  async delete(id) {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete contract error:', error);
      throw error.response?.data?.message || 'Failed to delete contract';
    }
  },

  // Get contracts by project
  async getContractsByProject(projectId) {
    try {
      const response = await api.get(`/api/contracts/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contracts for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get contract PDF
  async getPDF(id, config = {}) {
    try {
      // Default configuration
      const defaultConfig = {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      };

      // Merge with provided config
      const finalConfig = { ...defaultConfig, ...config };

      const response = await api.get(`${API_URL}/${id}/pdf`, finalConfig);
      
      // If the response is a blob, return it directly
      if (response.data instanceof Blob) {
        return response;
      }
      
      // If we get JSON but expected a blob, it's probably an error
      if (typeof response.data === 'object' && response.data !== null) {
        throw new Error(response.data.message || 'Failed to generate PDF');
      }
      
      // For any other case, create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      return { ...response, data: blob };
      
    } catch (error) {
      console.error('Get contract PDF error:', error);
      
      // Handle blob error responses
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to fetch contract PDF');
        }catch (error) {
          // If we can't parse the error, throw a generic error
          console.error('Failed to process PDF download', error);
        }
      }
      
      // For non-blob errors
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch contract PDF'
      );
    }
  },

  // Send contract email
  async sendEmail(id, recipientEmail) {
    try {
      const response = await api.post(`${API_URL}/${id}/email`, { recipientEmail });
      return response.data;
    } catch (error) {
      console.error('Send contract email error:', error);
      throw error.response?.data?.message || 'Failed to send contract email';
    }
  },

  // Approve contract
  async approve(id) {
    try {
      const response = await api.post(`${API_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve contract error:', error);
      throw error.response?.data?.message || 'Failed to approve contract';
    }
  },

  // Reject contract
  async reject(id, reason) {
    try {
      const response = await api.post(`${API_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject contract error:', error);
      throw error.response?.data?.message || 'Failed to reject contract';
    }
  },

  // Get contract history
  async getHistory(id) {
    try {
      const response = await api.get(`${API_URL}/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Get contract history error:', error);
      throw error.response?.data?.message || 'Failed to fetch contract history';
    }
  }
};

export default contractService;