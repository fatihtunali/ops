import api from './api';

const vehicleTypesService = {
  // Get all vehicle types
  getAll: async () => {
    const response = await api.get('/vehicle-types');
    return response.data;
  },

  // Get single vehicle type by ID
  getById: async (id) => {
    const response = await api.get(`/vehicle-types/${id}`);
    return response.data;
  }
};

export default vehicleTypesService;
