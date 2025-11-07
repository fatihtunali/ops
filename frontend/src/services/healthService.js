import api from './api';

export const healthService = {
  /**
   * Check backend health and database connectivity
   * @returns {Promise<object>} Health status
   */
  async checkHealth() {
    try {
      // Health endpoint is at /health (not /api/health)
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();

      if (response.ok) {
        return {
          status: 'healthy',
          server: true,
          database: data.database || false,
          endpoints: data.endpoints || 0,
          message: data.message || 'All systems operational',
        };
      } else {
        return {
          status: 'unhealthy',
          server: false,
          database: false,
          endpoints: 0,
          message: 'Backend responded with error',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message || 'Backend is not responding',
        database: false,
        server: false,
        endpoints: 0,
      };
    }
  },

  /**
   * Get API information
   * @returns {Promise<object>} API info
   */
  async getApiInfo() {
    try {
      const response = await api.get('/api');
      return response;
    } catch (error) {
      console.error('Failed to fetch API info:', error);
      return null;
    }
  },
};

export default healthService;
