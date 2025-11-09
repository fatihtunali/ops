import api from './api';

const tourRatesService = {
  /**
   * Get all tour rates with optional filters
   */
  getAll: async (params = {}) => {
    const response = await api.get('/tour-rates', { params });
    return response; // Interceptor already extracts .data
  },

  /**
   * Get single tour rate by ID
   */
  getById: async (id) => {
    const response = await api.get(`/tour-rates/${id}`);
    return response; // Interceptor already extracts .data
  },

  /**
   * Create new tour rate
   */
  create: async (data) => {
    const response = await api.post('/tour-rates', data);
    return response; // Interceptor already extracts .data
  },

  /**
   * Update existing tour rate
   */
  update: async (id, data) => {
    const response = await api.put(`/tour-rates/${id}`, data);
    return response; // Interceptor already extracts .data
  },

  /**
   * Delete tour rate
   */
  delete: async (id) => {
    const response = await api.delete(`/tour-rates/${id}`);
    return response; // Interceptor already extracts .data
  }
};

export default tourRatesService;
