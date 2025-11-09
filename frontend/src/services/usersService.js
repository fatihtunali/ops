import api from './api';

export const usersService = {
  /**
   * Get all users with optional filters
   * GET /api/users
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Get single user by ID
   * GET /api/users/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  /**
   * Create new user
   * POST /api/users
   */
  async create(userData) {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  /**
   * Update user
   * PUT /api/users/:id
   */
  async update(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  /**
   * Update user password
   * PUT /api/users/:id/password
   */
  async updatePassword(id, passwordData) {
    try {
      const response = await api.put(`/users/${id}/password`, passwordData);
      return response;
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  },

  /**
   * Deactivate user (soft delete)
   * DELETE /api/users/:id
   */
  async deactivate(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      throw error;
    }
  },

  /**
   * Activate user
   * PUT /api/users/:id/activate
   */
  async activate(id) {
    try {
      const response = await api.put(`/users/${id}/activate`);
      return response;
    } catch (error) {
      console.error('Failed to activate user:', error);
      throw error;
    }
  },
};

export default usersService;
