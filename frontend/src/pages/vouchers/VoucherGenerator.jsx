import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Loader, Badge } from '@components/common';
import { bookingsService } from '@services/bookingsService';
import voucherService from '@services/voucherService';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TruckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const VoucherGenerator = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [generatingVoucher, setGeneratingVoucher] = useState(null);
  const [error, setError] = useState(null);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);

  useEffect(() => {
    fetchBookings();
    loadGeneratedVouchers();
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

  const loadGeneratedVouchers = async () => {
    try {
      const vouchers = await voucherService.getAll();
      setGeneratedVouchers(Array.isArray(vouchers) ? vouchers : []);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    }
  };

  const handleBookingSelect = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setBookingData(null);

    if (!bookingId) {
      return;
    }

    try {
      setLoadingServices(true);
      const response = await voucherService.getBookingServices(bookingId);
      setBookingData(response?.data || response);
    } catch (err) {
      console.error('Failed to fetch booking services:', err);
      alert('Failed to load booking details. Please try again.');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleGenerateVoucher = async (serviceType, serviceId) => {
    const loadingKey = `${serviceType}-${serviceId}`;
    setGeneratingVoucher(loadingKey);

    try {
      let response;
      const bookingId = parseInt(selectedBookingId);

      switch (serviceType) {
        case 'hotel':
          response = await voucherService.generateHotelVoucher(bookingId, serviceId);
          break;
        case 'tour':
          response = await voucherService.generateTourVoucher(bookingId, serviceId);
          break;
        case 'transfer':
          response = await voucherService.generateTransferVoucher(bookingId, serviceId);
          break;
        case 'flight':
          response = await voucherService.generateFlightVoucher(bookingId, serviceId);
          break;
        default:
          throw new Error('Invalid service type');
      }

      // Extract voucher data from response
      const voucherData = response?.data?.data || response?.data || response;
      const voucherNumber = voucherData?.voucher_number || 'N/A';

      alert(`Voucher generated successfully!\nVoucher Number: ${voucherNumber}`);

      // Reload generated vouchers
      loadGeneratedVouchers();
    } catch (err) {
      console.error('Failed to generate voucher:', err);
      alert(`Failed to generate voucher: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setGeneratingVoucher(null);
    }
  };

  const handleDownloadVoucher = async (voucherId, voucherNumber) => {
    try {
      const blob = await voucherService.downloadVoucher(voucherId);
      voucherService.downloadBlob(blob, `${voucherNumber}.pdf`);
    } catch (err) {
      console.error('Failed to download voucher:', err);
      alert('Failed to download voucher. Please try again.');
    }
  };

  const handlePrintVoucher = async (voucherId) => {
    try {
      const blob = await voucherService.downloadVoucher(voucherId);
      const url = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Failed to print voucher:', err);
      alert('Failed to print voucher. Please try again.');
    }
  };

  const handleDeleteVoucher = async (voucherId, voucherNumber) => {
    if (!confirm(`Are you sure you want to delete voucher ${voucherNumber}?`)) {
      return;
    }

    try {
      await voucherService.deleteVoucher(voucherId);
      alert('Voucher deleted successfully!');
      loadGeneratedVouchers();
    } catch (err) {
      console.error('Failed to delete voucher:', err);
      alert('Failed to delete voucher. Please try again.');
    }
  };

  // Helper function to check if a service already has a voucher
  const hasVoucher = (serviceType, serviceId) => {
    return generatedVouchers.some(
      v => v.voucher_type === serviceType && v.service_id === serviceId
    );
  };

  // Helper function to get voucher for a service
  const getVoucherForService = (serviceType, serviceId) => {
    return generatedVouchers.find(
      v => v.voucher_type === serviceType && v.service_id === serviceId
    );
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

            {/* Traveler Details and Services */}
            {loadingServices ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : bookingData && (
              <>
                {/* Traveler Information */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Traveler Information</h3>
                      <Badge variant="info">For Voucher</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600">Booking Code</p>
                          <p className="text-base font-semibold text-slate-900">{bookingData.booking.booking_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Traveler Name</p>
                          <p className="text-base font-semibold text-slate-900">{bookingData.booking.traveler_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Traveler Email</p>
                          <p className="text-base text-slate-900">{bookingData.booking.traveler_email || '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600">Traveler Phone</p>
                          <p className="text-base text-slate-900">{bookingData.booking.traveler_phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Number of Passengers</p>
                          <p className="text-base text-slate-900">{bookingData.booking.pax_count || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Travel Period</p>
                          <p className="text-base text-slate-900">
                            {formatDate(bookingData.booking.travel_date_from)} - {formatDate(bookingData.booking.travel_date_to)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Passengers List */}
                    {bookingData.passengers && bookingData.passengers.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4" />
                          Passengers
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {bookingData.passengers.map((passenger, idx) => (
                            <div key={idx} className="text-sm text-slate-900">
                              {idx + 1}. {passenger.name} {passenger.date_of_birth && `(DOB: ${passenger.date_of_birth})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Services - Generate Vouchers */}
                <Card>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Generate Service Vouchers</h3>

                    {/* Hotels */}
                    {bookingData.services.hotels.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                          Hotels ({bookingData.services.hotels.length})
                        </h4>
                        <div className="space-y-2">
                          {bookingData.services.hotels.map((hotel) => {
                            const hasVoucherGenerated = hasVoucher('hotel', hotel.id);
                            const voucher = getVoucherForService('hotel', hotel.id);
                            return (
                              <div key={hotel.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900">{hotel.hotel_name}</p>
                                    {hasVoucherGenerated && (
                                      <Badge variant="success" className="flex items-center gap-1">
                                        <CheckCircleIcon className="w-3 h-3" />
                                        {voucher?.voucher_number}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    {formatDate(hotel.check_in)} - {formatDate(hotel.check_out)} ({hotel.nights} nights)
                                  </p>
                                  <p className="text-xs text-slate-500">{hotel.room_type}</p>
                                </div>
                                <Button
                                  size="sm"
                                  icon={DocumentTextIcon}
                                  onClick={() => handleGenerateVoucher('hotel', hotel.id)}
                                  disabled={generatingVoucher === `hotel-${hotel.id}` || hasVoucherGenerated}
                                >
                                  {generatingVoucher === `hotel-${hotel.id}` ? 'Generating...' : hasVoucherGenerated ? 'Generated' : 'Generate Voucher'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tours */}
                    {bookingData.services.tours.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <GlobeAltIcon className="w-5 h-5 text-green-600" />
                          Tours ({bookingData.services.tours.length})
                        </h4>
                        <div className="space-y-2">
                          {bookingData.services.tours.map((tour) => {
                            const hasVoucherGenerated = hasVoucher('tour', tour.id);
                            const voucher = getVoucherForService('tour', tour.id);
                            return (
                              <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900">{tour.tour_name}</p>
                                    {hasVoucherGenerated && (
                                      <Badge variant="success" className="flex items-center gap-1">
                                        <CheckCircleIcon className="w-3 h-3" />
                                        {voucher?.voucher_number}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    {formatDate(tour.tour_date)} - {tour.pax_count} pax
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  icon={DocumentTextIcon}
                                  onClick={() => handleGenerateVoucher('tour', tour.id)}
                                  disabled={generatingVoucher === `tour-${tour.id}` || hasVoucherGenerated}
                                >
                                  {generatingVoucher === `tour-${tour.id}` ? 'Generating...' : hasVoucherGenerated ? 'Generated' : 'Generate Voucher'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Transfers */}
                    {bookingData.services.transfers.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <TruckIcon className="w-5 h-5 text-orange-600" />
                          Transfers ({bookingData.services.transfers.length})
                        </h4>
                        <div className="space-y-2">
                          {bookingData.services.transfers.map((transfer) => {
                            const hasVoucherGenerated = hasVoucher('transfer', transfer.id);
                            const voucher = getVoucherForService('transfer', transfer.id);
                            return (
                              <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900">{transfer.transfer_type}</p>
                                    {hasVoucherGenerated && (
                                      <Badge variant="success" className="flex items-center gap-1">
                                        <CheckCircleIcon className="w-3 h-3" />
                                        {voucher?.voucher_number}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    {formatDate(transfer.transfer_date)} - {transfer.from_location} → {transfer.to_location}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  icon={DocumentTextIcon}
                                  onClick={() => handleGenerateVoucher('transfer', transfer.id)}
                                  disabled={generatingVoucher === `transfer-${transfer.id}` || hasVoucherGenerated}
                                >
                                  {generatingVoucher === `transfer-${transfer.id}` ? 'Generating...' : hasVoucherGenerated ? 'Generated' : 'Generate Voucher'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Flights */}
                    {bookingData.services.flights.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                          Flights ({bookingData.services.flights.length})
                        </h4>
                        <div className="space-y-2">
                          {bookingData.services.flights.map((flight) => {
                            const hasVoucherGenerated = hasVoucher('flight', flight.id);
                            const voucher = getVoucherForService('flight', flight.id);
                            return (
                              <div key={flight.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900">
                                      {flight.airline} {flight.flight_number}
                                    </p>
                                    {hasVoucherGenerated && (
                                      <Badge variant="success" className="flex items-center gap-1">
                                        <CheckCircleIcon className="w-3 h-3" />
                                        {voucher?.voucher_number}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    {formatDate(flight.departure_date)} - {flight.from_airport} → {flight.to_airport}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  icon={DocumentTextIcon}
                                  onClick={() => handleGenerateVoucher('flight', flight.id)}
                                  disabled={generatingVoucher === `flight-${flight.id}` || hasVoucherGenerated}
                                >
                                  {generatingVoucher === `flight-${flight.id}` ? 'Generating...' : hasVoucherGenerated ? 'Generated' : 'Generate Voucher'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No services */}
                    {bookingData.services.hotels.length === 0 &&
                      bookingData.services.tours.length === 0 &&
                      bookingData.services.transfers.length === 0 &&
                      bookingData.services.flights.length === 0 && (
                        <div className="text-center py-8">
                          <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-600">No services found for this booking</p>
                        </div>
                      )}
                  </div>
                </Card>
              </>
            )}

            {/* Previously Generated Vouchers */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Generated Vouchers</h3>
                  <Badge variant="secondary">{generatedVouchers.length} vouchers</Badge>
                </div>

                {generatedVouchers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Voucher Number</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Issued Date</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {generatedVouchers.map((voucher) => (
                          <tr key={voucher.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{voucher.voucher_number}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="info">{voucher.voucher_type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-slate-400" />
                                {voucher.issued_date || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={ArrowDownTrayIcon}
                                  onClick={() => handleDownloadVoucher(voucher.id, voucher.voucher_number)}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={PrinterIcon}
                                  onClick={() => handlePrintVoucher(voucher.id)}
                                >
                                  Print
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={TrashIcon}
                                  onClick={() => handleDeleteVoucher(voucher.id, voucher.voucher_number)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No vouchers generated yet</p>
                    <p className="text-sm text-slate-500 mt-1">Select a booking and generate vouchers for each service</p>
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
