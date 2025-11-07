import api from './api';

const SUPPLIER_PAYMENTS_ENDPOINT = '/supplier-payments';

export const supplierPaymentsService = {
  // Get all supplier payments
  getAll: async (params = {}) => {
    try {
      const response = await api.get(SUPPLIER_PAYMENTS_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier payments:', error);
      throw error;
    }
  },

  // Get supplier payment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`${SUPPLIER_PAYMENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier payment ${id}:`, error);
      throw error;
    }
  },

  // Create new supplier payment
  create: async (paymentData) => {
    try {
      const response = await api.post(SUPPLIER_PAYMENTS_ENDPOINT, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier payment:', error);
      throw error;
    }
  },

  // Update supplier payment
  update: async (id, paymentData) => {
    try {
      const response = await api.put(`${SUPPLIER_PAYMENTS_ENDPOINT}/${id}`, paymentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating supplier payment ${id}:`, error);
      throw error;
    }
  },

  // Delete supplier payment
  delete: async (id) => {
    try {
      const response = await api.delete(`${SUPPLIER_PAYMENTS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting supplier payment ${id}:`, error);
      throw error;
    }
  },

  // Get payment summary
  getSummary: async (params = {}) => {
    try {
      const response = await api.get(`${SUPPLIER_PAYMENTS_ENDPOINT}/summary`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier payment summary:', error);
      throw error;
    }
  },
};

export default supplierPaymentsService;
