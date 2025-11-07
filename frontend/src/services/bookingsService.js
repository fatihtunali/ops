import api from './api';

export const bookingsService = {
  /**
   * Get all bookings with optional filters
   * GET /api/bookings
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/bookings', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  },

  /**
   * Get single booking by ID
   * GET /api/bookings/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      throw error;
    }
  },

  /**
   * Create new booking
   * POST /api/bookings
   */
  async create(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return response;
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  },

  /**
   * Update booking
   * PUT /api/bookings/:id
   */
  async update(id, bookingData) {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData);
      return response;
    } catch (error) {
      console.error('Failed to update booking:', error);
      throw error;
    }
  },

  /**
   * Delete booking
   * DELETE /api/bookings/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete booking:', error);
      throw error;
    }
  },

  /**
   * Get recent bookings (last 10)
   */
  async getRecent(limit = 10) {
    try {
      const response = await api.get('/bookings', {
        params: {
          limit,
          sort: 'created_at',
          order: 'desc'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error);
      throw error;
    }
  },
};

export default bookingsService;
