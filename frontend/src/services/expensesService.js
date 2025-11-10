import api from './api';

export const expensesService = {
  /**
   * Get all operational expenses with optional filters
   * GET /api/operational-expenses
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/operational-expenses', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      throw error;
    }
  },

  /**
   * Get recurring expenses
   * GET /api/operational-expenses/recurring
   */
  async getRecurring() {
    try {
      const response = await api.get('/operational-expenses/recurring');
      return response;
    } catch (error) {
      console.error('Failed to fetch recurring expenses:', error);
      throw error;
    }
  },

  /**
   * Get single expense by ID
   * GET /api/operational-expenses/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/operational-expenses/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch expense:', error);
      throw error;
    }
  },

  /**
   * Create new expense
   * POST /api/operational-expenses
   */
  async create(expenseData) {
    try {
      const response = await api.post('/operational-expenses', expenseData);
      return response;
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  },

  /**
   * Update expense
   * PUT /api/operational-expenses/:id
   */
  async update(id, expenseData) {
    try {
      const response = await api.put(`/operational-expenses/${id}`, expenseData);
      return response;
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  },

  /**
   * Delete expense
   * DELETE /api/operational-expenses/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/operational-expenses/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  },
};

export default expensesService;
