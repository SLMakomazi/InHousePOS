import api from './api';

const projectService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await api.get('/api/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get a single project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update an existing project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },

  // Get projects by status
  getProjectsByStatus: async (status) => {
    try {
      const response = await api.get('/api/projects', { params: { status } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${status} projects:`, error);
      throw error;
    }
  },

  // Get projects by client
  getProjectsByClient: async (clientId) => {
    try {
      const response = await api.get(`/api/projects?clientId=${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for client ${clientId}:`, error);
      throw error;
    }
  },

  // Get projects with pagination
  getPaginatedProjects: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/api/projects', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated projects:', error);
      throw error;
    }
  },

  // Search projects
  searchProjects: async (query) => {
    try {
      const response = await api.get('/api/projects/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },

  // Generate contract
  generateContract: async (id, contractData) => {
    try {
      const response = await api.post(`/api/projects/${id}/contract`, contractData);
      return response.data;
    } catch (error) {
      console.error('Generate contract error:', error);
      throw error.response?.data?.message || 'Failed to generate contract';
    }
  },

  // Generate invoice
  generateInvoice: async (id, invoiceData) => {
    try {
      const response = await api.post(`/api/projects/${id}/invoice`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Generate invoice error:', error);
      throw error.response?.data?.message || 'Failed to generate invoice';
    }
  },

  // Get milestones
  getMilestones: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/milestones`);
      return response.data;
    } catch (error) {
      console.error('Get milestones error:', error);
      throw error.response?.data?.message || 'Failed to fetch milestones';
    }
  },

  // Add milestone
  addMilestone: async (id, milestoneData) => {
    try {
      const response = await api.post(`/api/projects/${id}/milestones`, milestoneData);
      return response.data;
    } catch (error) {
      console.error('Add milestone error:', error);
      throw error.response?.data?.message || 'Failed to add milestone';
    }
  },

  // Update milestone
  updateMilestone: async (id, milestoneId, milestoneData) => {
    try {
      const response = await api.put(`/api/projects/${id}/milestones/${milestoneId}`, milestoneData);
      return response.data;
    } catch (error) {
      console.error('Update milestone error:', error);
      throw error.response?.data?.message || 'Failed to update milestone';
    }
  },

  // Complete milestone
  completeMilestone: async (id, milestoneId) => {
    try {
      const response = await api.post(`/api/projects/${id}/milestones/${milestoneId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Complete milestone error:', error);
      throw error.response?.data?.message || 'Failed to complete milestone';
    }
  },

  // Get documents
  getDocuments: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/documents`);
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error.response?.data?.message || 'Failed to fetch documents';
    }
  },

  // Upload document
  uploadDocument: async (id, formData) => {
    try {
      const response = await api.post(`/api/projects/${id}/documents`, formData, {
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

  // Delete document
  deleteDocument: async (id, documentId) => {
    try {
      const response = await api.delete(`/api/projects/${id}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error.response?.data?.message || 'Failed to delete document';
    }
  },

  // Get timeline
  getTimeline: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Get timeline error:', error);
      throw error.response?.data?.message || 'Failed to fetch timeline';
    }
  },

  // Get financial report
  getFinancialReport: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/financial-report`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching financial report for project ${id}:`, error);
      throw error;
    }
  },
};

export default projectService;