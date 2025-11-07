import api from './api';

export const reportsService = {
  /**
   * Get dashboard statistics
   * GET /api/reports/dashboard-stats
   * Returns: inquiries count, confirmed bookings, revenue, profit, receivables, payables, upcoming departures
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/reports/dashboard-stats');
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get monthly P&L report
   * GET /api/reports/monthly-pl?month=YYYY-MM
   */
  async getMonthlyPL(month) {
    try {
      const response = await api.get('/reports/monthly-pl', {
        params: { month }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch monthly P&L:', error);
      throw error;
    }
  },

  /**
   * Get booking profitability
   * GET /api/reports/booking-profitability/:bookingId
   */
  async getBookingProfitability(bookingId) {
    try {
      const response = await api.get(`/reports/booking-profitability/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch booking profitability:', error);
      throw error;
    }
  },

  /**
   * Get cash flow report
   * GET /api/reports/cash-flow?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
   */
  async getCashFlow(fromDate, toDate) {
    try {
      const response = await api.get('/reports/cash-flow', {
        params: { from_date: fromDate, to_date: toDate }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch cash flow:', error);
      throw error;
    }
  },

  /**
   * Get sales by client
   * GET /api/reports/sales-by-client?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
   */
  async getSalesByClient(fromDate, toDate) {
    try {
      const response = await api.get('/reports/sales-by-client', {
        params: { from_date: fromDate, to_date: toDate }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch sales by client:', error);
      throw error;
    }
  },

  /**
   * Get sales by service type
   * GET /api/reports/sales-by-service?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
   */
  async getSalesByService(fromDate, toDate) {
    try {
      const response = await api.get('/reports/sales-by-service', {
        params: { from_date: fromDate, to_date: toDate }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch sales by service:', error);
      throw error;
    }
  },

  /**
   * Get sales by booking source (agent vs direct)
   * GET /api/reports/sales-by-source?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
   */
  async getSalesBySource(fromDate, toDate) {
    try {
      const response = await api.get('/reports/sales-by-source', {
        params: { from_date: fromDate, to_date: toDate }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch sales by source:', error);
      throw error;
    }
  },

  /**
   * Get outstanding receivables and payables
   * GET /api/reports/outstanding
   */
  async getOutstanding() {
    try {
      const response = await api.get('/reports/outstanding');
      return response;
    } catch (error) {
      console.error('Failed to fetch outstanding report:', error);
      throw error;
    }
  },

  /**
   * Export monthly P&L to Excel
   * POST /api/reports/export/monthly-pl
   */
  async exportMonthlyPL(month) {
    try {
      const response = await api.post('/reports/export/monthly-pl', { month }, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to export monthly P&L:', error);
      throw error;
    }
  },

  /**
   * Export cash flow to Excel
   * POST /api/reports/export/cash-flow
   */
  async exportCashFlow(fromDate, toDate) {
    try {
      const response = await api.post('/reports/export/cash-flow', {
        from_date: fromDate,
        to_date: toDate
      }, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to export cash flow:', error);
      throw error;
    }
  },

  /**
   * Export sales by client to Excel
   * POST /api/reports/export/sales-by-client
   */
  async exportSalesByClient(fromDate, toDate) {
    try {
      const response = await api.post('/reports/export/sales-by-client', {
        from_date: fromDate,
        to_date: toDate
      }, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to export sales by client:', error);
      throw error;
    }
  },

  /**
   * Export outstanding to Excel
   * POST /api/reports/export/outstanding
   */
  async exportOutstanding() {
    try {
      const response = await api.post('/reports/export/outstanding', {}, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to export outstanding:', error);
      throw error;
    }
  }
};

export default reportsService;
