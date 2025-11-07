import api from './api';

export const authService = {
  /**
   * Login user with username and password
   * @param {string} username - Username
   * @param {string} password - User password
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user (optional backend call if needed)
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // If backend has a logout endpoint, call it here
      // await api.post('/auth/logout');

      // Clear local storage
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API fails
      localStorage.removeItem('token');
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<object>} User object
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user (admin only)
   * @param {object} userData - User registration data
   * @returns {Promise<object>}
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<object>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh authentication token (if backend supports it)
   * @returns {Promise<{token: string}>}
   */
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>}
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<object>}
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
