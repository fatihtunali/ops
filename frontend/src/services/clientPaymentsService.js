import api from './api';

const CLIENT_PAYMENTS_ENDPOINT = '/client-payments';

export const clientPaymentsService = {
  // Get all client payments
  getAll: async (params = {}) => {
    try {
      const response = await api.get(CLIENT_PAYMENTS_ENDPOINT, { params });
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error('Error fetching client payments:', error);
      throw error;
    }
  },

  // Get client payment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`${CLIENT_PAYMENTS_ENDPOINT}/${id}`);
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error(`Error fetching client payment ${id}:`, error);
      throw error;
    }
  },

  // Get payments by booking ID
  getByBookingId: async (bookingId) => {
    try {
      const response = await api.get(CLIENT_PAYMENTS_ENDPOINT, {
        params: { booking_id: bookingId }
      });
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error(`Error fetching payments for booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Create new client payment
  create: async (paymentData) => {
    try {
      const response = await api.post(CLIENT_PAYMENTS_ENDPOINT, paymentData);
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error('Error creating client payment:', error);
      throw error;
    }
  },

  // Update client payment
  update: async (id, paymentData) => {
    try {
      const response = await api.put(`${CLIENT_PAYMENTS_ENDPOINT}/${id}`, paymentData);
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error(`Error updating client payment ${id}:`, error);
      throw error;
    }
  },

  // Delete client payment
  delete: async (id) => {
    try {
      const response = await api.delete(`${CLIENT_PAYMENTS_ENDPOINT}/${id}`);
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error(`Error deleting client payment ${id}:`, error);
      throw error;
    }
  },

  // Get payment summary
  getSummary: async (params = {}) => {
    try {
      const response = await api.get(`${CLIENT_PAYMENTS_ENDPOINT}/summary`, { params });
      return response; // Interceptor already extracts .data
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw error;
    }
  },
};

export default clientPaymentsService;
