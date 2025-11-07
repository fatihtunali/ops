import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Loader, Badge } from '@components/common';
import { bookingsService } from '@services/bookingsService';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const VoucherGenerator = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchBookings();
    loadPreviousVouchers();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getAll();
      const data = response?.data || response;
      const confirmedBookings = Array.isArray(data)
        ? data.filter((b) => b.status === 'confirmed')
        : [];
      setBookings(confirmedBookings);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousVouchers = () => {
    // Load from localStorage for now (placeholder)
    try {
      const saved = localStorage.getItem('generatedVouchers');
      if (saved) {
        setVouchers(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    }
  };

  const handleBookingSelect = async (bookingId) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) {
      setSelectedBooking(null);
      return;
    }

    try {
      const response = await bookingsService.getById(bookingId);
      setSelectedBooking(response?.data || response);
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      alert('Failed to load booking details. Please try again.');
    }
  };

  const handleGenerateVoucher = () => {
    if (!selectedBooking) {
      alert('Please select a booking first');
      return;
    }

    // Placeholder - show alert for now
    alert(`Voucher generation feature coming soon!\n\nVoucher will be generated for:\nBooking: ${selectedBooking.booking_code}\nClient: ${selectedBooking.client_name}\nDates: ${formatDate(selectedBooking.start_date)} - ${formatDate(selectedBooking.end_date)}`);

    // Save to voucher history (placeholder)
    const newVoucher = {
      id: Date.now(),
      booking_id: selectedBooking.id,
      booking_code: selectedBooking.booking_code,
      client_name: selectedBooking.client_name,
      generated_at: new Date().toISOString(),
      status: 'generated',
    };

    const updatedVouchers = [newVoucher, ...vouchers];
    setVouchers(updatedVouchers);
    localStorage.setItem('generatedVouchers', JSON.stringify(updatedVouchers));
  };

  const handleDownloadPDF = () => {
    if (!selectedBooking) {
      alert('Please select a booking first');
      return;
    }

    // Placeholder - show alert for now
    alert('PDF download feature coming soon!\n\nThis will download the voucher as a PDF file.');
  };

  const handlePrintVoucher = () => {
    if (!selectedBooking) {
      alert('Please select a booking first');
      return;
    }

    // Placeholder - show alert for now
    alert('Print feature coming soon!\n\nThis will open the print dialog for the voucher.');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Voucher Generator</h1>
          <p className="text-slate-600 mt-1">Generate and manage booking vouchers</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchBookings} className="mt-4">
                Retry
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Booking Selection */}
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Booking <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => handleBookingSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a booking...</option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.booking_code} - {booking.client_name} ({formatDate(booking.start_date)})
                      </option>
                    ))}
                  </select>
                </div>

                {bookings.length === 0 && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No confirmed bookings available for voucher generation</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Booking Details */}
            {selectedBooking && (
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Booking Details</h3>
                    <Badge variant="success">Confirmed</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Booking Code</p>
                        <p className="text-base font-semibold text-slate-900">{selectedBooking.booking_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Client Name</p>
                        <p className="text-base font-semibold text-slate-900">{selectedBooking.client_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="text-base text-slate-900">{selectedBooking.client_email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="text-base text-slate-900">{selectedBooking.client_phone || '-'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Start Date</p>
                        <p className="text-base font-semibold text-slate-900">{formatDate(selectedBooking.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">End Date</p>
                        <p className="text-base font-semibold text-slate-900">{formatDate(selectedBooking.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Number of Passengers</p>
                        <p className="text-base text-slate-900">{selectedBooking.number_of_pax || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Total Price</p>
                        <p className="text-base font-semibold text-green-600">
                          {formatCurrency(selectedBooking.total_price, selectedBooking.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.special_requests && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Special Requests</p>
                      <p className="text-base text-slate-900">{selectedBooking.special_requests}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button icon={DocumentTextIcon} onClick={handleGenerateVoucher} className="flex-1">
                      Generate Voucher
                    </Button>
                    <Button variant="secondary" icon={ArrowDownTrayIcon} onClick={handleDownloadPDF}>
                      Download PDF
                    </Button>
                    <Button variant="secondary" icon={PrinterIcon} onClick={handlePrintVoucher}>
                      Print
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Previously Generated Vouchers */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Previously Generated Vouchers</h3>
                  <Badge variant="secondary">{vouchers.length} vouchers</Badge>
                </div>

                {vouchers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Generated At</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {vouchers.map((voucher) => (
                          <tr key={voucher.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{voucher.booking_code}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{voucher.client_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-slate-400" />
                                {formatDate(voucher.generated_at)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="success">{voucher.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={ArrowDownTrayIcon}
                                  onClick={handleDownloadPDF}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={PrinterIcon}
                                  onClick={handlePrintVoucher}
                                >
                                  Print
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No vouchers generated yet</p>
                    <p className="text-sm text-slate-500 mt-1">Select a booking and click "Generate Voucher" to create your first voucher</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default VoucherGenerator;
