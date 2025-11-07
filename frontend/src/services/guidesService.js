import api from './api';

export const guidesService = {
  /**
   * Get all guides with optional filters
   * GET /api/guides
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/guides', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch guides:', error);
      throw error;
    }
  },

  /**
   * Get single guide by ID
   * GET /api/guides/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/guides/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch guide:', error);
      throw error;
    }
  },

  /**
   * Create new guide
   * POST /api/guides
   */
  async create(guideData) {
    try {
      const response = await api.post('/guides', guideData);
      return response;
    } catch (error) {
      console.error('Failed to create guide:', error);
      throw error;
    }
  },

  /**
   * Update guide
   * PUT /api/guides/:id
   */
  async update(id, guideData) {
    try {
      const response = await api.put(`/guides/${id}`, guideData);
      return response;
    } catch (error) {
      console.error('Failed to update guide:', error);
      throw error;
    }
  },

  /**
   * Delete guide
   * DELETE /api/guides/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/guides/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete guide:', error);
      throw error;
    }
  },
};

export default guidesService;
