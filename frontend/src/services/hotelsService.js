import api from './api';

export const hotelsService = {
  /**
   * Get all hotels with optional filters
   * GET /api/hotels
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/hotels', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      throw error;
    }
  },

  /**
   * Get single hotel by ID
   * GET /api/hotels/:id
   */
  async getById(id) {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
      throw error;
    }
  },

  /**
   * Create new hotel
   * POST /api/hotels
   */
  async create(hotelData) {
    try {
      const response = await api.post('/hotels', hotelData);
      return response;
    } catch (error) {
      console.error('Failed to create hotel:', error);
      throw error;
    }
  },

  /**
   * Update hotel
   * PUT /api/hotels/:id
   */
  async update(id, hotelData) {
    try {
      const response = await api.put(`/hotels/${id}`, hotelData);
      return response;
    } catch (error) {
      console.error('Failed to update hotel:', error);
      throw error;
    }
  },

  /**
   * Delete hotel
   * DELETE /api/hotels/:id
   */
  async delete(id) {
    try {
      const response = await api.delete(`/hotels/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      throw error;
    }
  },

  // ============================================================
  // SEASONAL RATES METHODS
  // ============================================================

  /**
   * Get all seasonal rates for a hotel
   * GET /api/hotels/:hotelId/seasonal-rates
   */
  async getSeasonalRates(hotelId) {
    try {
      const response = await api.get(`/hotels/${hotelId}/seasonal-rates`);
      return response;
    } catch (error) {
      console.error('Failed to fetch seasonal rates:', error);
      throw error;
    }
  },

  /**
   * Get rate for specific date
   * GET /api/hotels/:hotelId/seasonal-rates/date/:date
   */
  async getRateForDate(hotelId, date) {
    try {
      const response = await api.get(`/hotels/${hotelId}/seasonal-rates/date/${date}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch rate for date:', error);
      throw error;
    }
  },

  /**
   * Create seasonal rate
   * POST /api/hotels/:hotelId/seasonal-rates
   */
  async createSeasonalRate(hotelId, rateData) {
    try {
      const response = await api.post(`/hotels/${hotelId}/seasonal-rates`, rateData);
      return response;
    } catch (error) {
      console.error('Failed to create seasonal rate:', error);
      throw error;
    }
  },

  /**
   * Update seasonal rate
   * PUT /api/hotels/:hotelId/seasonal-rates/:rateId
   */
  async updateSeasonalRate(hotelId, rateId, rateData) {
    try {
      const response = await api.put(`/hotels/${hotelId}/seasonal-rates/${rateId}`, rateData);
      return response;
    } catch (error) {
      console.error('Failed to update seasonal rate:', error);
      throw error;
    }
  },

  /**
   * Delete seasonal rate
   * DELETE /api/hotels/:hotelId/seasonal-rates/:rateId
   */
  async deleteSeasonalRate(hotelId, rateId) {
    try {
      const response = await api.delete(`/hotels/${hotelId}/seasonal-rates/${rateId}`);
      return response;
    } catch (error) {
      console.error('Failed to delete seasonal rate:', error);
      throw error;
    }
  },

  /**
   * Calculate hotel price based on room configuration and dates
   * @param {Object} config - Configuration object
   * @param {number} config.hotelId - Hotel ID
   * @param {string} config.checkIn - Check-in date (YYYY-MM-DD)
   * @param {string} config.checkOut - Check-out date (YYYY-MM-DD)
   * @param {string} config.roomType - Room type (DBL, SGL, TRP, Suite, Special)
   * @param {Array} config.guests - Array of guest ages
   * @returns {Promise<Object>} Price calculation result
   */
  async calculatePrice(config) {
    try {
      const { hotelId, checkIn, roomType, guests } = config;

      // Get rate for check-in date
      const rateResponse = await this.getRateForDate(hotelId, checkIn);
      const rate = rateResponse.data;

      // Calculate based on room type and guests
      let totalPrice = 0;
      const adults = guests.filter(age => age >= 12);
      const children = guests.filter(age => age < 12);

      if (roomType === 'SGL') {
        // Single room: double rate + single supplement
        totalPrice = parseFloat(rate.price_per_person_double || 0) + parseFloat(rate.price_single_supplement || 0);
      } else if (roomType === 'DBL') {
        // Double room: adults pay double rate
        totalPrice = adults.length * parseFloat(rate.price_per_person_double || 0);
      } else if (roomType === 'TRP') {
        // Triple room: adults pay triple rate
        totalPrice = adults.length * parseFloat(rate.price_per_person_triple || 0);
      }

      // Add child prices
      children.forEach(age => {
        if (age < 3) {
          totalPrice += parseFloat(rate.price_child_0_2 || 0);
        } else if (age < 6) {
          totalPrice += parseFloat(rate.price_child_3_5 || 0);
        } else if (age < 12) {
          totalPrice += parseFloat(rate.price_child_6_11 || 0);
        }
      });

      return {
        success: true,
        data: {
          rate,
          totalPrice,
          pricePerNight: totalPrice,
          breakdown: {
            adults: adults.length,
            children: children.length,
            roomType
          }
        }
      };
    } catch (error) {
      console.error('Failed to calculate price:', error);
      throw error;
    }
  }
};

export default hotelsService;
