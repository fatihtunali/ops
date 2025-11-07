import api from './api';

export const passengersService = {
  /**
   * Get all passengers with optional filters
   * GET /api/passengers
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/passengers', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch passengers:', error);
      throw error;
    }
  },

  /**
   * Get passengers by booking ID
   * GET /api/passengers/booking/:booking_id
   */
  async getByBookingId(bookingId) {
    try {
      const response = await api.get(`/passengers/booking/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch passengers for booking:', error);
      throw error;
    }
  },

  /**
   * Get single passenger by ID
   * GET /api/passengers/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/passengers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch passenger:', error);
      throw error;
    }
  },

  /**
   * Create new passenger
   * POST /api/passengers
   */
  async create(passengerData) {
    try {
      const response = await api.post('/passengers', passengerData);
      return response;
    } catch (error) {
      console.error('Failed to create passenger:', error);
      throw error;
    }
  },

  /**
   * Update passenger
   * PUT /api/passengers/:id
   */
  async update(id, passengerData) {
    try {
      const response = await api.put(`/passengers/${id}`, passengerData);
      return response;
    } catch (error) {
      console.error('Failed to update passenger:', error);
      throw error;
    }
  },

  /**
   * Delete passenger
   * DELETE /api/passengers/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/passengers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete passenger:', error);
      throw error;
    }
  },
};

export default passengersService;
