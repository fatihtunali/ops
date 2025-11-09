import api from './api';

export const entranceFeesService = {
  /**
   * Get all entrance fees with optional filters
   * GET /api/entrance-fees
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/entrance-fees', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch entrance fees:', error);
      throw error;
    }
  },

  /**
   * Get single entrance fee by ID
   * GET /api/entrance-fees/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/entrance-fees/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch entrance fee:', error);
      throw error;
    }
  },

  /**
   * Create new entrance fee
   * POST /api/entrance-fees
   */
  async create(entranceFeeData) {
    try {
      const response = await api.post('/entrance-fees', entranceFeeData);
      return response;
    } catch (error) {
      console.error('Failed to create entrance fee:', error);
      throw error;
    }
  },

  /**
   * Update entrance fee
   * PUT /api/entrance-fees/:id
   */
  async update(id, entranceFeeData) {
    try {
      const response = await api.put(`/entrance-fees/${id}`, entranceFeeData);
      return response;
    } catch (error) {
      console.error('Failed to update entrance fee:', error);
      throw error;
    }
  },

  /**
   * Delete entrance fee (soft delete - sets is_active to false)
   * DELETE /api/entrance-fees/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/entrance-fees/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete entrance fee:', error);
      throw error;
    }
  },

  /**
   * Get distinct cities from entrance fees
   * GET /api/entrance-fees/cities
   */
  async getCities() {
    try {
      const response = await api.get('/entrance-fees/cities');
      return response;
    } catch (error) {
      console.error('Failed to fetch entrance fee cities:', error);
      throw error;
    }
  },
};

export default entranceFeesService;
