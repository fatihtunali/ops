import api from './api';

export const clientsService = {
  /**
   * Get all clients with optional filters
   * GET /api/clients
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/clients', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  },

  /**
   * Get single client by ID
   * GET /api/clients/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch client:', error);
      throw error;
    }
  },

  /**
   * Create new client
   * POST /api/clients
   */
  async create(clientData) {
    try {
      const response = await api.post('/clients', clientData);
      return response;
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  },

  /**
   * Update client
   * PUT /api/clients/:id
   */
  async update(id, clientData) {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response;
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  },

  /**
   * Delete client
   * DELETE /api/clients/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  },
};

export default clientsService;
