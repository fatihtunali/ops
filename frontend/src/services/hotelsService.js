import api from './api';

export const hotelsService = {
  /**
   * Get all hotels with optional filters
   * GET /api/hotels
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/hotels', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      throw error;
    }
  },

  /**
   * Get single hotel by ID
   * GET /api/hotels/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
      throw error;
    }
  },

  /**
   * Create new hotel
   * POST /api/hotels
   */
  async create(hotelData) {
    try {
      const response = await api.post('/hotels', hotelData);
      return response;
    } catch (error) {
      console.error('Failed to create hotel:', error);
      throw error;
    }
  },

  /**
   * Update hotel
   * PUT /api/hotels/:id
   */
  async update(id, hotelData) {
    try {
      const response = await api.put(`/hotels/${id}`, hotelData);
      return response;
    } catch (error) {
      console.error('Failed to update hotel:', error);
      throw error;
    }
  },

  /**
   * Delete hotel
   * DELETE /api/hotels/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/hotels/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      throw error;
    }
  },
};

export default hotelsService;
