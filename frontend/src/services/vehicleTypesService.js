import api from './api';

const vehicleTypesService = {
  // Get all vehicle types
  getAll: async () => {
    const response = await api.get('/vehicle-types');
    return response; // Interceptor already extracts .data
  },

  // Get single vehicle type by ID
  getById: async (id) => {
    const response = await api.get(`/vehicle-types/${id}`);
    return response; // Interceptor already extracts .data
  }
};

export default vehicleTypesService;
