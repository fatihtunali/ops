import api from './api';

const guideRatesService = {
  /**
   * Get all guide rates with optional filters
   */
  getAll: async (params = {}) => {
    const response = await api.get('/guide-rates', { params });
    return response;
  },

  /**
   * Get single guide rate by ID
   */
  getById: async (id) => {
    const response = await api.get(`/guide-rates/${id}`);
    return response;
  },

  /**
   * Create new guide rate
   */
  create: async (data) => {
    const response = await api.post('/guide-rates', data);
    return response;
  },

  /**
   * Update existing guide rate
   */
  update: async (id, data) => {
    const response = await api.put(`/guide-rates/${id}`, data);
    return response;
  },

  /**
   * Delete guide rate
   */
  delete: async (id) => {
    const response = await api.delete(`/guide-rates/${id}`);
    return response;
  }
};

export default guideRatesService;
