import api from './api';

const vehicleRatesService = {
  // Get all vehicle rates with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/vehicle-rates', { params });
    return response.data;
  },

  // Get single vehicle rate by ID
  getById: async (id) => {
    const response = await api.get(`/vehicle-rates/${id}`);
    return response.data;
  },

  // Get list of cities with vehicle rates
  getCities: async () => {
    const response = await api.get('/vehicle-rates/cities');
    return response.data;
  },

  // Get suppliers for a specific city
  getSuppliersByCity: async (city) => {
    const response = await api.get('/vehicle-rates/suppliers', {
      params: { city }
    });
    return response.data;
  },

  // Create new vehicle rate
  create: async (rateData) => {
    const response = await api.post('/vehicle-rates', rateData);
    return response.data;
  },

  // Update vehicle rate
  update: async (id, rateData) => {
    const response = await api.put(`/vehicle-rates/${id}`, rateData);
    return response.data;
  },

  // Delete vehicle rate (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/vehicle-rates/${id}`);
    return response.data;
  },

  // Search rates for booking (by city, supplier, date)
  searchForBooking: async ({ city, supplier_id, date, vehicle_type_id }) => {
    const response = await api.get('/vehicle-rates', {
      params: {
        city,
        supplier_id,
        date,
        vehicle_type_id,
        is_active: 'true'
      }
    });
    return response.data;
  }
};

export default vehicleRatesService;
