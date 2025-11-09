import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader } from '@components/common';
import { bookingsService } from '@services/bookingsService';
import { formatDate, formatCurrency } from '@utils/formatters';
import { BOOKING_STATUS_COLORS, BOOKING_STATUSES } from '@utils/constants';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const BookingsList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookedByFilter, setBookedByFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, [currentPage, sortField, sortOrder, statusFilter, bookedByFilter, dateFrom, dateTo]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
        order: sortOrder,
      };

      if (statusFilter) params.status = statusFilter;
      if (bookedByFilter) params.booked_by = bookedByFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (searchTerm) params.search = searchTerm;

      const response = await bookingsService.getAll(params);
      const data = response?.data || response;

      console.log('Bookings API Response:', JSON.stringify(data, null, 2)); // Debug log
      const firstBooking = (data.bookings || data)[0];
      console.log('First booking dates:', {
        travel_date_from: firstBooking?.travel_date_from,
        travel_date_to: firstBooking?.travel_date_to,
        typeof_from: typeof firstBooking?.travel_date_from,
        typeof_to: typeof firstBooking?.travel_date_to
      }); // Debug log

      if (data && Array.isArray(data.bookings || data)) {
        setBookings(data.bookings || data);
        setTotalCount(data.total || data.length);
        setTotalPages(Math.ceil((data.total || data.length) / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setBookedByFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage all tour bookings and reservations</p>
          </div>
          <Button
            icon={PlusIcon}
            onClick={() => navigate('/bookings/create')}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Filters */}
        <Card padding="normal">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Input
                  type="text"
                  label="Search"
                  placeholder="Search by booking code or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={MagnifyingGlassIcon}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booked By Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Booking Source
                </label>
                <select
                  value={bookedByFilter}
                  onChange={(e) => setBookedByFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Sources</option>
                  <option value="agent">Agent Bookings</option>
                  <option value="direct">Direct Bookings</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  label="From Date"
                />
              </div>

              {/* Date To */}
              <div>
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  label="To Date"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <Button type="submit" icon={FunnelIcon} size="sm">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {bookings.length} of {totalCount} bookings
        </div>

        {/* Bookings Table */}
        <Card padding="none">
          {loading ? (
            <div className="p-12">
              <Loader fullPage={false} text="Loading bookings..." />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">No bookings found</p>
              <Button
                onClick={() => navigate('/bookings/create')}
                icon={PlusIcon}
              >
                Create First Booking
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('booking_code')}
                      >
                        Booking Code <SortIcon field="booking_code" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('client_name')}
                      >
                        Client <SortIcon field="client_name" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('booked_by')}
                      >
                        Type <SortIcon field="booked_by" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('travel_date_from')}
                      >
                        Travel Dates <SortIcon field="travel_date_from" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        PAX
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('status')}
                      >
                        Status <SortIcon field="status" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                        onClick={() => handleSort('total_sell_price')}
                      >
                        Total <SortIcon field="total_sell_price" />
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-200">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id || booking.booking_id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">
                            {booking.booking_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {booking.booked_by === 'agent' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-900">
                                {booking.client_name || 'N/A'}
                              </span>
                              {booking.traveler_name && (
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <span>→ Traveler:</span>
                                  <span className="font-medium text-slate-700">{booking.traveler_name}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-900">
                              {booking.client_name || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.booked_by === 'agent' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Agent
                            </span>
                          ) : booking.booked_by === 'direct' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Direct
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {formatDate(booking.travel_date_from || booking.start_date)} -{' '}
                          {formatDate(booking.travel_date_to || booking.end_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {booking.pax_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={BOOKING_STATUS_COLORS[booking.status] || 'secondary'}
                            size="sm"
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {formatCurrency(booking.total_sell_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/bookings/${booking.id || booking.booking_id}`)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/bookings/${booking.id || booking.booking_id}/edit`)}
                              className="text-slate-600 hover:text-slate-800 transition-colors"
                              title="Edit Booking"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id || booking.booking_id}
                    className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm"
                  >
                    {/* Header with Booking Code and Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Booking Code</div>
                        <div className="text-base font-bold text-blue-600">
                          {booking.booking_code}
                        </div>
                      </div>
                      <Badge
                        variant={BOOKING_STATUS_COLORS[booking.status] || 'secondary'}
                        size="sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>

                    {/* Client Info */}
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-1">Client</div>
                      {booking.booked_by === 'agent' ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-slate-900">
                            {booking.client_name || 'N/A'}
                          </div>
                          {booking.traveler_name && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <span>→ Traveler:</span>
                              <span className="font-medium text-slate-700">{booking.traveler_name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-900">
                          {booking.client_name || 'N/A'}
                        </div>
                      )}
                    </div>

                    {/* Travel Dates and Type */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Travel Dates</div>
                        <div className="text-sm text-slate-700">
                          {formatDate(booking.travel_date_from || booking.start_date)}
                          <br />
                          {formatDate(booking.travel_date_to || booking.end_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Type</div>
                        {booking.booked_by === 'agent' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Agent
                          </span>
                        ) : booking.booked_by === 'direct' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Direct
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </div>

                    {/* PAX and Total */}
                    <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">PAX</div>
                        <div className="text-sm font-medium text-slate-700">{booking.pax_count}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Total</div>
                        <div className="text-sm font-bold text-slate-900">
                          {formatCurrency(booking.total_sell_price)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/bookings/${booking.id || booking.booking_id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/bookings/${booking.id || booking.booking_id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ChevronLeftIcon}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        iconPosition="right"
                        icon={ChevronRightIcon}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookingsList;
