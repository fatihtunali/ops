import api from './api';

export const tourSuppliersService = {
  /**
   * Get all tour suppliers with optional filters
   * GET /api/tour-suppliers
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/tour-suppliers', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch tour suppliers:', error);
      throw error;
    }
  },

  /**
   * Get single tour supplier by ID
   * GET /api/tour-suppliers/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/tour-suppliers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch tour supplier:', error);
      throw error;
    }
  },

  /**
   * Create new tour supplier
   * POST /api/tour-suppliers
   */
  async create(supplierData) {
    try {
      const response = await api.post('/tour-suppliers', supplierData);
      return response;
    } catch (error) {
      console.error('Failed to create tour supplier:', error);
      throw error;
    }
  },

  /**
   * Update tour supplier
   * PUT /api/tour-suppliers/:id
   */
  async update(id, supplierData) {
    try {
      const response = await api.put(`/tour-suppliers/${id}`, supplierData);
      return response;
    } catch (error) {
      console.error('Failed to update tour supplier:', error);
      throw error;
    }
  },

  /**
   * Delete tour supplier
   * DELETE /api/tour-suppliers/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/tour-suppliers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete tour supplier:', error);
      throw error;
    }
  },

  /**
   * Get distinct cities from tour suppliers
   * GET /api/tour-suppliers/cities
   */
  async getCities() {
    try {
      const response = await api.get('/tour-suppliers/cities');
      return response;
    } catch (error) {
      console.error('Failed to fetch tour supplier cities:', error);
      throw error;
    }
  },
};

export default tourSuppliersService;
