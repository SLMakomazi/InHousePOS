import axios from 'axios';

// frontend/src/services/projectService.js
const API_URL = '/api/projects';

const projectService = {
  create: async (projectData) => {
    try {
      const response = await axios.post(API_URL, projectData);
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error.response?.data?.message || 'Failed to create project';
    }
  },

  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error.response?.data?.message || 'Failed to fetch projects';
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get project error:', error);
      throw error.response?.data?.message || 'Failed to fetch project';
    }
  },

  update: async (id, projectData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error.response?.data?.message || 'Failed to update project';
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error.response?.data?.message || 'Failed to delete project';
    }
  },

  generateContract: async (id, contractData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/contract`, contractData);
      return response.data;
    } catch (error) {
      console.error('Generate contract error:', error);
      throw error.response?.data?.message || 'Failed to generate contract';
    }
  },

  generateInvoice: async (id, invoiceData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/invoice`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Generate invoice error:', error);
      throw error.response?.data?.message || 'Failed to generate invoice';
    }
  },

  getMilestones: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/milestones`);
      return response.data;
    } catch (error) {
      console.error('Get milestones error:', error);
      throw error.response?.data?.message || 'Failed to fetch milestones';
    }
  },

  addMilestone: async (id, milestoneData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/milestones`, milestoneData);
      return response.data;
    } catch (error) {
      console.error('Add milestone error:', error);
      throw error.response?.data?.message || 'Failed to add milestone';
    }
  },

  updateMilestone: async (id, milestoneId, milestoneData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/milestones/${milestoneId}`, milestoneData);
      return response.data;
    } catch (error) {
      console.error('Update milestone error:', error);
      throw error.response?.data?.message || 'Failed to update milestone';
    }
  },

  completeMilestone: async (id, milestoneId) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/milestones/${milestoneId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Complete milestone error:', error);
      throw error.response?.data?.message || 'Failed to complete milestone';
    }
  },

  getDocuments: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/documents`);
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error.response?.data?.message || 'Failed to fetch documents';
    }
  },

  uploadDocument: async (id, formData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error.response?.data?.message || 'Failed to upload document';
    }
  },

  deleteDocument: async (id, documentId) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error.response?.data?.message || 'Failed to delete document';
    }
  },

  getTimeline: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Get timeline error:', error);
      throw error.response?.data?.message || 'Failed to fetch timeline';
    }
  },

  getFinancialReport: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/financial`);
      return response.data;
    } catch (error) {
      console.error('Get financial report error:', error);
      throw error.response?.data?.message || 'Failed to fetch financial report';
    }
  }
};

export default projectService;