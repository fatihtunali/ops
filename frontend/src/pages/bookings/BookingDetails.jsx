import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Badge, Loader } from '@components/common';
import { bookingsService } from '@services/bookingsService';
import { bookingServicesService } from '@services/bookingServicesService';
import { passengersService } from '@services/passengersService';
import { reportsService } from '@services/reportsService';
import { formatDate, formatCurrency, formatDateTime } from '@utils/formatters';
import { BOOKING_STATUS_COLORS, ROOM_TYPES } from '@utils/constants';
import {
  PencilIcon,
  ArrowLeftIcon,
  UsersIcon,
  BuildingOfficeIcon,
  TruckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [profitability, setProfitability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);

      // Fetch booking first (required)
      const bookingRes = await bookingsService.getById(id);
      setBooking(bookingRes?.data || bookingRes);

      // Fetch all other data in parallel (optional - failures won't break the page)
      const [
        hotelsRes,
        toursRes,
        transfersRes,
        flightsRes,
        passengersRes,
        profitabilityRes,
      ] = await Promise.allSettled([
        bookingServicesService.hotels.getByBookingId(id),
        bookingServicesService.tours.getByBookingId(id),
        bookingServicesService.transfers.getByBookingId(id),
        bookingServicesService.flights.getByBookingId(id),
        passengersService.getByBookingId(id),
        reportsService.getBookingProfitability(id),
      ]);

      // Extract data from successful responses
      setHotels(hotelsRes.status === 'fulfilled' ? (hotelsRes.value?.data || hotelsRes.value || []) : []);
      setTours(toursRes.status === 'fulfilled' ? (toursRes.value?.data || toursRes.value || []) : []);
      setTransfers(transfersRes.status === 'fulfilled' ? (transfersRes.value?.data || transfersRes.value || []) : []);
      setFlights(flightsRes.status === 'fulfilled' ? (flightsRes.value?.data || flightsRes.value || []) : []);
      setPassengers(passengersRes.status === 'fulfilled' ? (passengersRes.value?.data || passengersRes.value || []) : []);
      setProfitability(profitabilityRes.status === 'fulfilled' ? (profitabilityRes.value?.data || profitabilityRes.value) : null);

      setError(null);
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: null },
    { id: 'hotels', label: `Hotels (${hotels.length})`, icon: BuildingOfficeIcon },
    { id: 'tours', label: `Tours (${tours.length})`, icon: GlobeAltIcon },
    { id: 'transfers', label: `Transfers (${transfers.length})`, icon: TruckIcon },
    { id: 'flights', label: `Flights (${flights.length})`, icon: null },
    { id: 'passengers', label: `Passengers (${passengers.length})`, icon: UsersIcon },
    { id: 'profitability', label: 'Profitability', icon: CurrencyDollarIcon },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Loader fullPage text="Loading booking details..." />
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error || 'Booking not found'}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/bookings')}
            className="mt-4"
          >
            Back to Bookings
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              icon={ArrowLeftIcon}
              onClick={() => navigate('/bookings')}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {booking.booking_code}
              </h1>
              <p className="text-slate-600 mt-1">{booking.client_name}</p>
            </div>
            <Badge
              variant={BOOKING_STATUS_COLORS[booking.status]}
              size="lg"
            >
              {booking.status}
            </Badge>
          </div>
          <Button
            icon={PencilIcon}
            onClick={() => navigate(`/bookings/${id}/edit`)}
          >
            Edit Booking
          </Button>
        </div>

        {/* Tabs */}
        <Card padding="none">
          <div className="border-b border-blue-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-blue-300'
                      }
                    `}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Travel Dates</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {formatDate(booking.travel_date_from)} - {formatDate(booking.travel_date_to)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Passengers</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {booking.pax_count} PAX
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Status</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {booking.is_confirmed ? 'Confirmed' : 'Not Confirmed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Total Sell Price</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {formatCurrency(booking.total_sell_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Total Cost Price</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {formatCurrency(booking.total_cost_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Gross Profit</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {formatCurrency(booking.gross_profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Amount Received</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {formatCurrency(booking.amount_received)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Outstanding</p>
                    <p className="text-sm font-medium text-orange-600 mt-1">
                      {formatCurrency(booking.total_sell_price - booking.amount_received)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Payment Status</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {booking.payment_status || 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Billed To and Traveler Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billed To (Client who pays) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase">Billed To</h3>
                      {booking.booked_by === 'agent' && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Agent</span>
                      )}
                      {booking.booked_by === 'direct' && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">Direct</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900">{booking.client_name}</p>
                      {booking.client_email && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Email:</span> {booking.client_email}
                        </p>
                      )}
                      {booking.client_phone && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Phone:</span> {booking.client_phone}
                        </p>
                      )}
                      {booking.booked_by === 'agent' && (
                        <p className="text-xs text-blue-700 mt-2">
                          This booking was made through a tour operator/agent.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Traveler Information (Actual passenger) */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">Traveler (Passenger)</h3>
                    {booking.booked_by === 'agent' && booking.traveler_name ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">{booking.traveler_name}</p>
                        {booking.traveler_email && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Email:</span> {booking.traveler_email}
                          </p>
                        )}
                        {booking.traveler_phone && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Phone:</span> {booking.traveler_phone}
                          </p>
                        )}
                      </div>
                    ) : booking.booked_by === 'direct' ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">{booking.client_name}</p>
                        {booking.client_email && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Email:</span> {booking.client_email}
                          </p>
                        )}
                        {booking.client_phone && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Phone:</span> {booking.client_phone}
                          </p>
                        )}
                        <p className="text-xs text-green-700 mt-2">
                          Direct booking - client and traveler are the same.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No traveler information provided</p>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-2">Notes</p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDateTime(booking.created_at)}
                  </div>
                  {booking.confirmed_at && (
                    <div>
                      <span className="font-medium">Confirmed:</span>{' '}
                      {formatDateTime(booking.confirmed_at)}
                    </div>
                  )}
                  {booking.completed_at && (
                    <div>
                      <span className="font-medium">Completed:</span>{' '}
                      {formatDateTime(booking.completed_at)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hotels Tab */}
            {activeTab === 'hotels' && (
              <div>
                {hotels.length === 0 ? (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No hotels added yet</p>
                    <Button size="sm">Add Hotel</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900">{hotel.hotel_name}</h3>
                            <p className="text-sm text-slate-600">
                              {ROOM_TYPES.find((rt) => rt.value === hotel.room_type)?.label || hotel.room_type || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {formatCurrency(hotel.sell_price)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Cost: {formatCurrency(hotel.total_cost)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Check-in:</span>
                            <p className="font-medium">{formatDate(hotel.check_in)}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Check-out:</span>
                            <p className="font-medium">{formatDate(hotel.check_out)}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Nights:</span>
                            <p className="font-medium">{hotel.nights}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Rooms:</span>
                            <p className="font-medium">{hotel.number_of_rooms}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tours Tab */}
            {activeTab === 'tours' && (
              <div>
                {tours.length === 0 ? (
                  <div className="text-center py-12">
                    <GlobeAltIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No tours added yet</p>
                    <Button size="sm">Add Tour</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tours.map((tour) => (
                      <div key={tour.id} className="border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900">{tour.tour_name}</h3>
                            <p className="text-sm text-slate-600">
                              {tour.operation_type === 'supplier' ? 'External Supplier' : 'Self-Operated'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {formatCurrency(tour.sell_price)}
                            </p>
                            {tour.operation_type === 'supplier' && (
                              <p className="text-xs text-slate-500">
                                Cost: {formatCurrency(tour.supplier_cost)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Date:</span>
                            <p className="font-medium">{formatDate(tour.tour_date)}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Duration:</span>
                            <p className="font-medium">{tour.duration}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">PAX:</span>
                            <p className="font-medium">{tour.pax_count}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Transfers Tab */}
            {activeTab === 'transfers' && (
              <div>
                {transfers.length === 0 ? (
                  <div className="text-center py-12">
                    <TruckIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No transfers added yet</p>
                    <Button size="sm">Add Transfer</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((transfer) => (
                      <div key={transfer.id} className="border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900">{transfer.transfer_type}</h3>
                            <p className="text-sm text-slate-600">{transfer.vehicle_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {formatCurrency(transfer.sell_price)}
                            </p>
                            {transfer.operation_type === 'supplier' && (
                              <p className="text-xs text-slate-500">
                                Cost: {formatCurrency(transfer.supplier_cost)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Date:</span>
                            <p className="font-medium">{formatDate(transfer.transfer_date)}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">From:</span>
                            <p className="font-medium">{transfer.from_location}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">To:</span>
                            <p className="font-medium">{transfer.to_location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flights Tab */}
            {activeTab === 'flights' && (
              <div>
                {flights.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 mb-4">No flights added yet</p>
                    <Button size="sm">Add Flight</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flights.map((flight) => (
                      <div key={flight.id} className="border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900">
                              {flight.airline} - {flight.flight_number}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {flight.from_airport} → {flight.to_airport}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {formatCurrency(flight.sell_price)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Cost: {formatCurrency(flight.cost_price)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Departure:</span>
                            <p className="font-medium">{formatDateTime(flight.departure_date)}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Arrival:</span>
                            <p className="font-medium">{formatDateTime(flight.arrival_date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Passengers Tab */}
            {activeTab === 'passengers' && (
              <div>
                {passengers.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No passengers added yet</p>
                    <Button size="sm">Add Passenger</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Passport</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Nationality</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Date of Birth</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-200">
                        {passengers.map((passenger) => (
                          <tr key={passenger.id}>
                            <td className="px-4 py-3 text-sm text-slate-900">{passenger.full_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{passenger.passport_number}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{passenger.nationality}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{formatDate(passenger.date_of_birth)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Profitability Tab */}
            {activeTab === 'profitability' && (
              <div className="space-y-6">
                {profitability ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 uppercase mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(profitability.total_revenue)}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-xs text-red-600 uppercase mb-1">Total Cost</p>
                        <p className="text-2xl font-bold text-red-700">
                          {formatCurrency(profitability.total_cost)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-green-600 uppercase mb-1">Gross Profit</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(profitability.gross_profit)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 uppercase mb-1">Profit Margin</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {profitability.profit_margin}%
                        </p>
                      </div>
                    </div>

                    {profitability.breakdown && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-3">Service Breakdown</h3>
                        <div className="space-y-2">
                          {profitability.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200">
                              <span className="text-sm text-slate-700">{item.service_type}</span>
                              <div className="flex gap-4 text-sm">
                                <span className="text-blue-600">Rev: {formatCurrency(item.revenue)}</span>
                                <span className="text-red-600">Cost: {formatCurrency(item.cost)}</span>
                                <span className="text-green-600 font-medium">
                                  Profit: {formatCurrency(item.profit)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No profitability data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookingDetails;
