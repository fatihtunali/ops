import api from './api';

const citiesService = {
  /**
   * Get all cities
   */
  getAll: async () => {
    const response = await api.get('/cities');
    return response; // Interceptor already extracts .data
  },

  /**
   * Search cities by name
   */
  search: async (query) => {
    const response = await api.get('/cities/search', {
      params: { q: query }
    });
    return response; // Interceptor already extracts .data
  },

  /**
   * Get cities by region
   */
  getByRegion: async (region) => {
    const response = await api.get(`/cities/region/${region}`);
    return response; // Interceptor already extracts .data
  }
};

export default citiesService;
