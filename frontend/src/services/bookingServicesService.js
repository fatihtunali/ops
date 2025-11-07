import api from './api';

/**
 * Service for managing booking services (hotels, tours, transfers, flights)
 */
export const bookingServicesService = {
  // ========== BOOKING HOTELS ==========
  hotels: {
    /**
     * Get all booking hotels with optional filters
     * GET /api/booking-hotels
     * @param {object} params - Query parameters (booking_id, payment_status, check_in_from, check_in_to)
     */
    async getAll(params = {}) {
      try {
        const response = await api.get('/booking-hotels', { params });
        return response;
      } catch (error) {
        console.error('Failed to fetch booking hotels:', error);
        throw error;
      }
    },

    /**
     * Get booking hotels by booking ID (uses query param)
     * GET /api/booking-hotels?booking_id={bookingId}
     */
    async getByBookingId(bookingId) {
      try {
        const response = await api.get('/booking-hotels', {
          params: { booking_id: bookingId }
        });
        return response;
      } catch (error) {
        console.error('Failed to fetch booking hotels for booking:', error);
        throw error;
      }
    },

    /**
     * Get single booking hotel by ID
     * GET /api/booking-hotels/:id
     */
    async getById(id) {
      try {
        const response = await api.get(`/booking-hotels/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking hotel:', error);
        throw error;
      }
    },

    /**
     * Create new booking hotel
     * POST /api/booking-hotels
     */
    async create(hotelData) {
      try {
        const response = await api.post('/booking-hotels', hotelData);
        return response;
      } catch (error) {
        console.error('Failed to create booking hotel:', error);
        throw error;
      }
    },

    /**
     * Update booking hotel
     * PUT /api/booking-hotels/:id
     */
    async update(id, hotelData) {
      try {
        const response = await api.put(`/booking-hotels/${id}`, hotelData);
        return response;
      } catch (error) {
        console.error('Failed to update booking hotel:', error);
        throw error;
      }
    },

    /**
     * Delete booking hotel
     * DELETE /api/booking-hotels/:id
     */
    async delete(id) {
      try {
        const response = await api.delete(`/booking-hotels/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to delete booking hotel:', error);
        throw error;
      }
    },
  },

  // ========== BOOKING TOURS ==========
  tours: {
    /**
     * Get all booking tours
     * GET /api/booking-tours
     */
    async getAll(params = {}) {
      try {
        const response = await api.get('/booking-tours', { params });
        return response;
      } catch (error) {
        console.error('Failed to fetch booking tours:', error);
        throw error;
      }
    },

    /**
     * Get booking tours by booking ID
     * GET /api/booking-tours/booking/:booking_id
     */
    async getByBookingId(bookingId) {
      try {
        const response = await api.get(`/booking-tours/booking/${bookingId}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking tours:', error);
        throw error;
      }
    },

    /**
     * Get single booking tour by ID
     * GET /api/booking-tours/:id
     */
    async getById(id) {
      try {
        const response = await api.get(`/booking-tours/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking tour:', error);
        throw error;
      }
    },

    /**
     * Create new booking tour
     * POST /api/booking-tours
     */
    async create(tourData) {
      try {
        const response = await api.post('/booking-tours', tourData);
        return response;
      } catch (error) {
        console.error('Failed to create booking tour:', error);
        throw error;
      }
    },

    /**
     * Update booking tour
     * PUT /api/booking-tours/:id
     */
    async update(id, tourData) {
      try {
        const response = await api.put(`/booking-tours/${id}`, tourData);
        return response;
      } catch (error) {
        console.error('Failed to update booking tour:', error);
        throw error;
      }
    },

    /**
     * Delete booking tour
     * DELETE /api/booking-tours/:id
     */
    async delete(id) {
      try {
        const response = await api.delete(`/booking-tours/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to delete booking tour:', error);
        throw error;
      }
    },
  },

  // ========== BOOKING TRANSFERS ==========
  transfers: {
    /**
     * Get all booking transfers
     * GET /api/booking-transfers
     */
    async getAll(params = {}) {
      try {
        const response = await api.get('/booking-transfers', { params });
        return response;
      } catch (error) {
        console.error('Failed to fetch booking transfers:', error);
        throw error;
      }
    },

    /**
     * Get booking transfers by booking ID
     * GET /api/booking-transfers/booking/:bookingId
     */
    async getByBookingId(bookingId) {
      try {
        const response = await api.get(`/booking-transfers/booking/${bookingId}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking transfers:', error);
        throw error;
      }
    },

    /**
     * Get single booking transfer by ID
     * GET /api/booking-transfers/:id
     */
    async getById(id) {
      try {
        const response = await api.get(`/booking-transfers/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking transfer:', error);
        throw error;
      }
    },

    /**
     * Create new booking transfer
     * POST /api/booking-transfers
     */
    async create(transferData) {
      try {
        const response = await api.post('/booking-transfers', transferData);
        return response;
      } catch (error) {
        console.error('Failed to create booking transfer:', error);
        throw error;
      }
    },

    /**
     * Update booking transfer
     * PUT /api/booking-transfers/:id
     */
    async update(id, transferData) {
      try {
        const response = await api.put(`/booking-transfers/${id}`, transferData);
        return response;
      } catch (error) {
        console.error('Failed to update booking transfer:', error);
        throw error;
      }
    },

    /**
     * Delete booking transfer
     * DELETE /api/booking-transfers/:id
     */
    async delete(id) {
      try {
        const response = await api.delete(`/booking-transfers/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to delete booking transfer:', error);
        throw error;
      }
    },
  },

  // ========== BOOKING FLIGHTS ==========
  flights: {
    /**
     * Get all booking flights
     * GET /api/booking-flights
     */
    async getAll(params = {}) {
      try {
        const response = await api.get('/booking-flights', { params });
        return response;
      } catch (error) {
        console.error('Failed to fetch booking flights:', error);
        throw error;
      }
    },

    /**
     * Get booking flights by booking ID
     * GET /api/booking-flights/booking/:booking_id
     */
    async getByBookingId(bookingId) {
      try {
        const response = await api.get(`/booking-flights/booking/${bookingId}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking flights:', error);
        throw error;
      }
    },

    /**
     * Get single booking flight by ID
     * GET /api/booking-flights/:id
     */
    async getById(id) {
      try {
        const response = await api.get(`/booking-flights/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch booking flight:', error);
        throw error;
      }
    },

    /**
     * Create new booking flight
     * POST /api/booking-flights
     */
    async create(flightData) {
      try {
        const response = await api.post('/booking-flights', flightData);
        return response;
      } catch (error) {
        console.error('Failed to create booking flight:', error);
        throw error;
      }
    },

    /**
     * Update booking flight
     * PUT /api/booking-flights/:id
     */
    async update(id, flightData) {
      try {
        const response = await api.put(`/booking-flights/${id}`, flightData);
        return response;
      } catch (error) {
        console.error('Failed to update booking flight:', error);
        throw error;
      }
    },

    /**
     * Delete booking flight
     * DELETE /api/booking-flights/:id
     */
    async delete(id) {
      try {
        const response = await api.delete(`/booking-flights/${id}`);
        return response;
      } catch (error) {
        console.error('Failed to delete booking flight:', error);
        throw error;
      }
    },
  },
};

export default bookingServicesService;
