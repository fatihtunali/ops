import api from './api';

export const vehiclesService = {
  /**
   * Get all vehicles with optional filters
   * GET /api/vehicles
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/vehicles', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      throw error;
    }
  },

  /**
   * Get single vehicle by ID
   * GET /api/vehicles/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
      throw error;
    }
  },

  /**
   * Create new vehicle
   * POST /api/vehicles
   */
  async create(vehicleData) {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  },

  /**
   * Update vehicle
   * PUT /api/vehicles/:id
   */
  async update(id, vehicleData) {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return response;
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  },

  /**
   * Delete vehicle
   * DELETE /api/vehicles/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  },
};

export default vehiclesService;
