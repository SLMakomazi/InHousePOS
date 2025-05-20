import axios from 'axios';

// frontend/src/services/invoiceService.js
const API_URL = '/api/invoices';

const invoiceService = {
  create: async (projectId, invoiceData) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error.response?.data?.message || 'Failed to create invoice';
    }
  },

  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Get invoices error:', error);
      throw error.response?.data?.message || 'Failed to fetch invoices';
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get invoice error:', error);
      throw error.response?.data?.message || 'Failed to fetch invoice';
    }
  },

  update: async (id, invoiceData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Update invoice error:', error);
      throw error.response?.data?.message || 'Failed to update invoice';
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete invoice error:', error);
      throw error.response?.data?.message || 'Failed to delete invoice';
    }
  },

  getPDF: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/pdf`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Get invoice PDF error:', error);
      throw error.response?.data?.message || 'Failed to fetch invoice PDF';
    }
  },

  sendEmail: async (id, recipientEmail) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/email`, { recipientEmail });
      return response.data;
    } catch (error) {
      console.error('Send invoice email error:', error);
      throw error.response?.data?.message || 'Failed to send invoice email';
    }
  },

  generateStatement: async (projectId, startDate, endDate) => {
    try {
      const response = await axios.post(`${API_URL}/statement`, {
        projectId,
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      console.error('Generate statement error:', error);
      throw error.response?.data?.message || 'Failed to generate statement';
    }
  },

  getStatementPDF: async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/statement/${projectId}/pdf`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Get statement PDF error:', error);
      throw error.response?.data?.message || 'Failed to fetch statement PDF';
    }
  }
};

export default invoiceService;