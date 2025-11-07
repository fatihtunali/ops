import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { clientPaymentsService } from '@services/clientPaymentsService';
import { bookingsService } from '@services/bookingsService';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingFilter, setBookingFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [bookedByFilter, setBookedByFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: '',
    amount: '',
    currency: 'USD',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Summary stats
  const [summary, setSummary] = useState({
    total_received: 0,
    total_pending: 0,
    payment_count: 0,
  });

  // Fetch payments and bookings
  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await clientPaymentsService.getAll();
      const data = response?.data || response;
      setPayments(Array.isArray(data) ? data : []);
      calculateSummary(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingsService.getAll();
      const data = response?.data || response;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const calculateSummary = (paymentsData) => {
    const total = paymentsData.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    setSummary({
      total_received: total,
      total_pending: 0, // Calculate from bookings if needed
      payment_count: paymentsData.length,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.booking_id) errors.booking_id = 'Please select a booking';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.payment_date) errors.payment_date = 'Payment date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingPayment) {
        await clientPaymentsService.update(editingPayment.id, payload);
      } else {
        await clientPaymentsService.create(payload);
      }

      await fetchPayments();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save payment:', err);
      alert(`Failed to ${editingPayment ? 'update' : 'create'} payment. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      booking_id: payment.booking_id,
      amount: payment.amount,
      currency: payment.currency,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await clientPaymentsService.delete(id);
      await fetchPayments();
    } catch (err) {
      console.error('Failed to delete payment:', err);
      alert('Failed to delete payment. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      booking_id: '',
      amount: '',
      currency: 'USD',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setFormErrors({});
    setEditingPayment(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchTerm === '' ||
      payment.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBooking = bookingFilter === '' || payment.booking_id === parseInt(bookingFilter);
    const matchesMethod = paymentMethodFilter === '' || payment.payment_method === paymentMethodFilter;
    const matchesBookedBy = bookedByFilter === '' || payment.booked_by === bookedByFilter;

    return matchesSearch && matchesBooking && matchesMethod && matchesBookedBy;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Client Payments</h1>
            <p className="text-slate-600 mt-1">Track payments received from clients</p>
          </div>
          <Button icon={PlusIcon} onClick={handleAddNew}>
            Add Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Received</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total_received)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Payment Count</p>
                <p className="text-2xl font-bold text-slate-900">{summary.payment_count}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total_pending)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by booking, client, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Bookings</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.booking_code} - {booking.client_name}
                </option>
              ))}
            </select>

            <select
              value={bookedByFilter}
              onChange={(e) => setBookedByFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="agent">Agent Payments</option>
              <option value="direct">Direct Payments</option>
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
            </select>

            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setBookingFilter('');
                setBookedByFilter('');
                setPaymentMethodFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchPayments} className="mt-4">
                Retry
              </Button>
            </div>
          ) : paginatedPayments.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No payments found</p>
              <Button onClick={handleAddNew} className="mt-4">
                Add First Payment
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {payment.booking_code || `#${payment.booking_id}`}
                        </td>
                        <td className="px-4 py-3">
                          {payment.booked_by === 'agent' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-900">{payment.client_name}</span>
                              {payment.traveler_name && (
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <span>→ Traveler:</span>
                                  <span className="font-medium text-slate-700">{payment.traveler_name}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-900">{payment.client_name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {payment.booked_by === 'agent' ? (
                            <Badge variant="primary">Agent</Badge>
                          ) : payment.booked_by === 'direct' ? (
                            <Badge variant="success">Direct</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(payment.payment_date)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">
                            {payment.payment_method?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{payment.reference_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={PencilIcon}
                              onClick={() => handleEdit(payment)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={TrashIcon}
                              onClick={() => handleDelete(payment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of{' '}
                    {filteredPayments.length} payments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingPayment ? 'Edit Payment' : 'Add New Payment'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Booking <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.booking_id}
                onChange={(e) => handleInputChange('booking_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.booking_id ? 'border-red-500' : 'border-slate-300'
                }`}
                required
              >
                <option value="">Select a booking...</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.client_name}
                  </option>
                ))}
              </select>
              {formErrors.booking_id && <p className="text-red-500 text-sm mt-1">{formErrors.booking_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  label="Amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  error={formErrors.amount}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="TRY">TRY</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="Payment Date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  error={formErrors.payment_date}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                type="text"
                label="Reference Number"
                value={formData.reference_number}
                onChange={(e) => handleInputChange('reference_number', e.target.value)}
                placeholder="Transaction reference, check number, etc."
              />
            </div>

            <div>
              <Input
                type="textarea"
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="3"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Saving...' : editingPayment ? 'Update Payment' : 'Add Payment'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ClientPayments;
