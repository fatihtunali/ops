import api from './api';

/**
 * Voucher Service
 * Handles all voucher-related API calls
 */

const voucherService = {
  /**
   * Get all vouchers (with filters)
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.booking_id) params.append('booking_id', filters.booking_id);
    if (filters.voucher_type) params.append('voucher_type', filters.voucher_type);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/vouchers?${params.toString()}`);
    // Note: api interceptor already extracts response.data
    // So response = { success, data: [...], count }
    return response.data || [];
  },

  /**
   * Get single voucher by ID
   */
  getById: async (id) => {
    const response = await api.get(`/vouchers/${id}`);
    return response.data;
  },

  /**
   * Get booking services for voucher generation
   */
  getBookingServices: async (bookingId) => {
    const response = await api.get(`/vouchers/booking/${bookingId}/services`);
    return response.data;
  },

  /**
   * Generate hotel voucher
   */
  generateHotelVoucher: async (bookingId, hotelId) => {
    const response = await api.post('/vouchers/generate/hotel', {
      booking_id: bookingId,
      hotel_id: hotelId
    });
    return response.data;
  },

  /**
   * Generate tour voucher
   */
  generateTourVoucher: async (bookingId, tourId) => {
    const response = await api.post('/vouchers/generate/tour', {
      booking_id: bookingId,
      tour_id: tourId
    });
    return response.data;
  },

  /**
   * Generate transfer voucher
   */
  generateTransferVoucher: async (bookingId, transferId) => {
    const response = await api.post('/vouchers/generate/transfer', {
      booking_id: bookingId,
      transfer_id: transferId
    });
    return response.data;
  },

  /**
   * Generate flight voucher
   */
  generateFlightVoucher: async (bookingId, flightId) => {
    const response = await api.post('/vouchers/generate/flight', {
      booking_id: bookingId,
      flight_id: flightId
    });
    return response.data;
  },

  /**
   * Download voucher PDF
   */
  downloadVoucher: async (voucherId) => {
    const response = await api.get(`/vouchers/${voucherId}/download`, {
      responseType: 'blob'
    });
    // When responseType is 'blob', the interceptor returns the full response object
    return response.data;
  },

  /**
   * Delete voucher
   */
  deleteVoucher: async (voucherId) => {
    const response = await api.delete(`/vouchers/${voucherId}`);
    return response;
  },

  /**
   * Helper function to download blob as file
   */
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default voucherService;
