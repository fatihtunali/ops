import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Loader } from '@components/common';
import { bookingsService } from '@services/bookingsService';
import { clientsService } from '@services/clientsService';
import { hotelsService } from '@services/hotelsService';
import { tourSuppliersService } from '@services/tourSuppliersService';
import { guidesService } from '@services/guidesService';
import { vehiclesService } from '@services/vehiclesService';
import { bookingServicesService } from '@services/bookingServicesService';
import { formatDate, formatCurrency } from '@utils/formatters';
import { BOOKING_STATUS } from '@utils/constants';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const CreateBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});

  // Step 1: Basic Information
  const [bookingData, setBookingData] = useState({
    client_id: '',
    pax_count: 1,
    travel_date_from: '',
    travel_date_to: '',
    status: BOOKING_STATUS.INQUIRY,
    traveler_name: '',
    traveler_email: '',
    traveler_phone: '',
    booked_by: 'direct',
    notes: '',
  });

  // Step 2: Services
  const [services, setServices] = useState({
    hotels: [],
    tours: [],
    transfers: [],
    flights: [],
  });

  // Store existing booking totals (for edit mode)
  const [existingTotals, setExistingTotals] = useState({
    totalSell: 0,
    totalCost: 0,
    grossProfit: 0,
  });

  // Service tab management
  const [activeServiceTab, setActiveServiceTab] = useState('hotels');

  // Hotel form management
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [editingHotelIndex, setEditingHotelIndex] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [hotelForm, setHotelForm] = useState({
    hotel_id: '',
    hotel_name: '',
    check_in: '',
    check_out: '',
    nights: 0,
    room_type: '',
    number_of_rooms: 1,
    cost_per_night: 0,
    total_cost: 0,
    sell_price: 0,
    margin: 0,
    payment_status: 'pending',
    paid_amount: 0,
    payment_due_date: '',
    confirmation_number: '',
    voucher_issued: false,
    notes: '',
  });

  // Tour form management
  const [showTourForm, setShowTourForm] = useState(false);
  const [editingTourIndex, setEditingTourIndex] = useState(null);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [tourForm, setTourForm] = useState({
    tour_name: '',
    tour_date: '',
    duration: '',
    pax_count: 1,
    operation_type: 'supplier',
    supplier_id: '',
    supplier_cost: 0,
    guide_id: '',
    guide_cost: 0,
    vehicle_id: '',
    vehicle_cost: 0,
    entrance_fees: 0,
    other_costs: 0,
    total_cost: 0,
    sell_price: 0,
    margin: 0,
    payment_status: 'pending',
    paid_amount: 0,
    payment_due_date: '',
    confirmation_number: '',
    voucher_issued: false,
    notes: '',
  });

  // Transfer form management
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingTransferIndex, setEditingTransferIndex] = useState(null);
  const [transferForm, setTransferForm] = useState({
    transfer_type: 'Airport Pickup',
    transfer_date: '',
    from_location: '',
    to_location: '',
    pax_count: 1,
    vehicle_type: '',
    operation_type: 'supplier',
    supplier_id: '',
    vehicle_id: '',
    cost_price: 0,
    sell_price: 0,
    margin: 0,
    payment_status: 'pending',
    paid_amount: 0,
    confirmation_number: '',
    voucher_issued: false,
    notes: '',
  });

  // Flight form management
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [editingFlightIndex, setEditingFlightIndex] = useState(null);
  const [flightForm, setFlightForm] = useState({
    airline: '',
    flight_number: '',
    departure_date: '',
    arrival_date: '',
    from_airport: '',
    to_airport: '',
    pax_count: 1,
    cost_price: 0,
    sell_price: 0,
    margin: 0,
    payment_status: 'pending',
    paid_amount: 0,
    pnr: '',
    ticket_numbers: '',
    voucher_issued: false,
    notes: '',
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchClients();
    fetchHotels();
    fetchSuppliers();
    fetchGuides();
    fetchVehicles();
  }, []);

  // Fetch booking data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchBookingData();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await clientsService.getAll();
      const data = response?.data || response;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await hotelsService.getAll();
      const data = response?.data || response;
      setAvailableHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await tourSuppliersService.getAll();
      const data = response?.data || response;
      setAvailableSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const fetchGuides = async () => {
    try {
      const response = await guidesService.getAll();
      const data = response?.data || response;
      setAvailableGuides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesService.getAll();
      const data = response?.data || response;
      setAvailableVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchBookingData = async () => {
    try {
      setInitialLoading(true);
      const response = await bookingsService.getById(id);
      const booking = response?.data || response;

      console.log('Fetched booking data:', booking); // Debug log

      // Format dates for input fields (YYYY-MM-DD)
      // Backend sends dates in DD/MM/YYYY format
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        // Parse DD/MM/YYYY format
        const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(ddmmyyyyRegex);

        if (match) {
          const [, day, month, year] = match;
          // Return in YYYY-MM-DD format for HTML date input
          return `${year}-${month}-${day}`;
        }

        // Fallback: try to parse as ISO date
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error('Date parsing error:', e);
        }

        return '';
      };

      // Populate booking data
      setBookingData({
        client_id: booking.client_id,
        pax_count: booking.pax_count,
        travel_date_from: formatDateForInput(booking.travel_date_from),
        travel_date_to: formatDateForInput(booking.travel_date_to),
        status: booking.status,
        traveler_name: booking.traveler_name || '',
        traveler_email: booking.traveler_email || '',
        traveler_phone: booking.traveler_phone || '',
        booked_by: booking.booked_by || 'direct',
        notes: booking.notes || '',
      });

      // Store existing totals for display in edit mode
      setExistingTotals({
        totalSell: parseFloat(booking.total_sell_price) || 0,
        totalCost: parseFloat(booking.total_cost_price) || 0,
        grossProfit: parseFloat(booking.gross_profit) || 0,
      });

      console.log('Formatted dates:', {
        from: formatDateForInput(booking.travel_date_from),
        to: formatDateForInput(booking.travel_date_to)
      }); // Debug log

      // Note: Services would need to be fetched separately from their respective endpoints
      // For now, we'll leave services empty - you can add this later if needed

    } catch (error) {
      console.error('Failed to fetch booking:', error);
      alert('Failed to load booking data. Redirecting to bookings list.');
      navigate('/bookings');
    } finally {
      setInitialLoading(false);
    }
  };

  // Step 1 validation
  const validateStep1 = () => {
    const newErrors = {};

    if (!bookingData.client_id) {
      newErrors.client_id = 'Please select a client';
    }

    // Validate traveler name for agent bookings
    const selectedClient = clients.find((c) => c.id === parseInt(bookingData.client_id));
    if (selectedClient && selectedClient.type === 'agent' && !bookingData.traveler_name) {
      newErrors.traveler_name = 'Traveler name is required for agent bookings';
    }

    if (!bookingData.travel_date_from) {
      newErrors.travel_date_from = 'Start date is required';
    }
    if (!bookingData.travel_date_to) {
      newErrors.travel_date_to = 'End date is required';
    }
    if (bookingData.travel_date_from && bookingData.travel_date_to) {
      if (new Date(bookingData.travel_date_from) > new Date(bookingData.travel_date_to)) {
        newErrors.travel_date_to = 'End date must be after start date';
      }
    }
    if (!bookingData.pax_count || bookingData.pax_count < 1) {
      newErrors.pax_count = 'At least 1 passenger required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleInputChange = (field, value) => {
    // Special handling for client_id selection
    if (field === 'client_id') {
      const selectedClient = clients.find((c) => c.id === parseInt(value));
      if (selectedClient) {
        setBookingData((prev) => ({
          ...prev,
          client_id: value,
          booked_by: selectedClient.type, // Set booked_by to 'agent' or 'direct'
          // Auto-populate traveler info for direct clients
          traveler_name: selectedClient.type === 'direct' ? selectedClient.name : prev.traveler_name,
          traveler_email: selectedClient.type === 'direct' ? selectedClient.email : prev.traveler_email,
          traveler_phone: selectedClient.type === 'direct' ? selectedClient.phone : prev.traveler_phone,
        }));
      } else {
        setBookingData((prev) => ({ ...prev, client_id: value }));
      }
    } else {
      setBookingData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateTotals = () => {
    // In edit mode, if no services have been modified, use existing totals
    const hasServices = services.hotels.length > 0 ||
                       services.tours.length > 0 ||
                       services.transfers.length > 0 ||
                       services.flights.length > 0;

    if (isEditMode && !hasServices && existingTotals.totalSell > 0) {
      // Return existing totals from database
      return existingTotals;
    }

    // Otherwise, calculate from services
    let totalSell = 0;
    let totalCost = 0;

    // Sum up all services
    services.hotels.forEach((hotel) => {
      totalSell += parseFloat(hotel.sell_price) || 0;
      totalCost += parseFloat(hotel.total_cost) || 0;
    });

    services.tours.forEach((tour) => {
      totalSell += parseFloat(tour.sell_price) || 0;
      totalCost += parseFloat(tour.supplier_cost || tour.self_operated_cost || 0);
    });

    services.transfers.forEach((transfer) => {
      totalSell += parseFloat(transfer.sell_price) || 0;
      totalCost += parseFloat(transfer.supplier_cost || transfer.self_operated_cost || 0);
    });

    services.flights.forEach((flight) => {
      totalSell += parseFloat(flight.sell_price) || 0;
      totalCost += parseFloat(flight.cost_price) || 0;
    });

    return {
      totalSell,
      totalCost,
      grossProfit: totalSell - totalCost,
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const totals = calculateTotals();

      const payload = {
        ...bookingData,
        total_sell_price: totals.totalSell,
        total_cost_price: totals.totalCost,
        gross_profit: totals.grossProfit,
        is_confirmed: bookingData.status === BOOKING_STATUS.CONFIRMED,
        services,
      };

      let response;
      if (isEditMode) {
        response = await bookingsService.update(id, payload);
      } else {
        response = await bookingsService.create(payload);
      }

      const data = response?.data || response;

      // Navigate to the booking
      navigate(`/bookings/${id || data.id || data.booking_id}`);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} booking:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} booking. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const addService = (type, serviceData) => {
    setServices((prev) => ({
      ...prev,
      [type]: [...prev[type], serviceData],
    }));
  };

  const removeService = (type, index) => {
    setServices((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // Hotel form handlers
  const handleHotelFormChange = (field, value) => {
    setHotelForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-select hotel name when hotel_id changes
      if (field === 'hotel_id' && value) {
        const selectedHotel = availableHotels.find((h) => h.id === parseInt(value));
        if (selectedHotel) {
          updated.hotel_name = selectedHotel.name;
        }
      }

      // Auto-calculate nights when dates change
      if (field === 'check_in' || field === 'check_out') {
        if (updated.check_in && updated.check_out) {
          const checkIn = new Date(updated.check_in);
          const checkOut = new Date(updated.check_out);
          const diffTime = checkOut - checkIn;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updated.nights = diffDays > 0 ? diffDays : 0;
        }
      }

      // Auto-calculate total cost when relevant fields change
      if (
        field === 'cost_per_night' ||
        field === 'nights' ||
        field === 'number_of_rooms'
      ) {
        const costPerNight = parseFloat(updated.cost_per_night) || 0;
        const nights = parseInt(updated.nights) || 0;
        const rooms = parseInt(updated.number_of_rooms) || 1;
        updated.total_cost = costPerNight * nights * rooms;
      }

      // Auto-calculate margin when costs change
      if (field === 'sell_price' || field === 'total_cost') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const totalCost = parseFloat(updated.total_cost) || 0;
        updated.margin = sellPrice - totalCost;
      }

      return updated;
    });
  };

  const resetHotelForm = () => {
    setHotelForm({
      hotel_id: '',
      hotel_name: '',
      check_in: '',
      check_out: '',
      nights: 0,
      room_type: '',
      number_of_rooms: 1,
      cost_per_night: 0,
      total_cost: 0,
      sell_price: 0,
      margin: 0,
      payment_status: 'pending',
      paid_amount: 0,
      payment_due_date: '',
      confirmation_number: '',
      voucher_issued: false,
      notes: '',
    });
    setEditingHotelIndex(null);
  };

  const handleAddHotel = () => {
    setShowHotelForm(true);
    resetHotelForm();
  };

  const handleEditHotel = (index) => {
    setEditingHotelIndex(index);
    setHotelForm(services.hotels[index]);
    setShowHotelForm(true);
  };

  const handleSaveHotel = () => {
    // Validation
    if (!hotelForm.hotel_id || !hotelForm.check_in || !hotelForm.check_out) {
      alert('Please fill in all required fields (Hotel, Check-in, Check-out)');
      return;
    }

    if (editingHotelIndex !== null) {
      // Update existing hotel
      const updatedHotels = [...services.hotels];
      updatedHotels[editingHotelIndex] = hotelForm;
      setServices((prev) => ({ ...prev, hotels: updatedHotels }));
    } else {
      // Add new hotel
      addService('hotels', hotelForm);
    }

    setShowHotelForm(false);
    resetHotelForm();
  };

  const handleCancelHotelForm = () => {
    setShowHotelForm(false);
    resetHotelForm();
  };

  const handleDeleteHotel = (index) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      removeService('hotels', index);
    }
  };

  // Tour form handlers
  const handleTourFormChange = (field, value) => {
    setTourForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total cost for self-operated tours
      if (field === 'guide_cost' || field === 'vehicle_cost' || field === 'entrance_fees' || field === 'other_costs' || field === 'supplier_cost') {
        if (updated.operation_type === 'self-operated') {
          const guideCost = parseFloat(updated.guide_cost) || 0;
          const vehicleCost = parseFloat(updated.vehicle_cost) || 0;
          const entranceFees = parseFloat(updated.entrance_fees) || 0;
          const otherCosts = parseFloat(updated.other_costs) || 0;
          updated.total_cost = guideCost + vehicleCost + entranceFees + otherCosts;
        } else {
          updated.total_cost = parseFloat(updated.supplier_cost) || 0;
        }
      }

      // Reset fields when operation type changes
      if (field === 'operation_type') {
        if (value === 'supplier') {
          updated.guide_id = '';
          updated.guide_cost = 0;
          updated.vehicle_id = '';
          updated.vehicle_cost = 0;
          updated.entrance_fees = 0;
          updated.other_costs = 0;
        } else {
          updated.supplier_id = '';
          updated.supplier_cost = 0;
        }
      }

      // Auto-calculate margin
      if (field === 'sell_price' || field === 'total_cost' || field === 'guide_cost' || field === 'vehicle_cost' || field === 'entrance_fees' || field === 'other_costs' || field === 'supplier_cost') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const totalCost = parseFloat(updated.total_cost) || 0;
        updated.margin = sellPrice - totalCost;
      }

      return updated;
    });
  };

  const resetTourForm = () => {
    setTourForm({
      tour_name: '',
      tour_date: '',
      duration: '',
      pax_count: 1,
      operation_type: 'supplier',
      supplier_id: '',
      supplier_cost: 0,
      guide_id: '',
      guide_cost: 0,
      vehicle_id: '',
      vehicle_cost: 0,
      entrance_fees: 0,
      other_costs: 0,
      total_cost: 0,
      sell_price: 0,
      margin: 0,
      payment_status: 'pending',
      paid_amount: 0,
      payment_due_date: '',
      confirmation_number: '',
      voucher_issued: false,
      notes: '',
    });
    setEditingTourIndex(null);
  };

  const handleAddTour = () => {
    setShowTourForm(true);
    resetTourForm();
  };

  const handleEditTour = (index) => {
    setEditingTourIndex(index);
    setTourForm(services.tours[index]);
    setShowTourForm(true);
  };

  const handleSaveTour = () => {
    if (!tourForm.tour_name || !tourForm.tour_date) {
      alert('Please fill in all required fields (Tour Name, Tour Date)');
      return;
    }

    if (editingTourIndex !== null) {
      const updatedTours = [...services.tours];
      updatedTours[editingTourIndex] = tourForm;
      setServices((prev) => ({ ...prev, tours: updatedTours }));
    } else {
      addService('tours', tourForm);
    }

    setShowTourForm(false);
    resetTourForm();
  };

  const handleCancelTourForm = () => {
    setShowTourForm(false);
    resetTourForm();
  };

  const handleDeleteTour = (index) => {
    if (confirm('Are you sure you want to delete this tour?')) {
      removeService('tours', index);
    }
  };

  // Transfer form handlers
  const handleTransferFormChange = (field, value) => {
    setTransferForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate margin
      if (field === 'sell_price' || field === 'cost_price') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const costPrice = parseFloat(updated.cost_price) || 0;
        updated.margin = sellPrice - costPrice;
      }

      return updated;
    });
  };

  const resetTransferForm = () => {
    setTransferForm({
      transfer_type: 'Airport Pickup',
      transfer_date: '',
      from_location: '',
      to_location: '',
      pax_count: 1,
      vehicle_type: '',
      operation_type: 'supplier',
      supplier_id: '',
      vehicle_id: '',
      cost_price: 0,
      sell_price: 0,
      margin: 0,
      payment_status: 'pending',
      paid_amount: 0,
      confirmation_number: '',
      voucher_issued: false,
      notes: '',
    });
    setEditingTransferIndex(null);
  };

  const handleAddTransfer = () => {
    setShowTransferForm(true);
    resetTransferForm();
  };

  const handleEditTransfer = (index) => {
    setEditingTransferIndex(index);
    setTransferForm(services.transfers[index]);
    setShowTransferForm(true);
  };

  const handleSaveTransfer = () => {
    if (!transferForm.transfer_date || !transferForm.from_location || !transferForm.to_location) {
      alert('Please fill in all required fields (Date, From Location, To Location)');
      return;
    }

    if (editingTransferIndex !== null) {
      const updatedTransfers = [...services.transfers];
      updatedTransfers[editingTransferIndex] = transferForm;
      setServices((prev) => ({ ...prev, transfers: updatedTransfers }));
    } else {
      addService('transfers', transferForm);
    }

    setShowTransferForm(false);
    resetTransferForm();
  };

  const handleCancelTransferForm = () => {
    setShowTransferForm(false);
    resetTransferForm();
  };

  const handleDeleteTransfer = (index) => {
    if (confirm('Are you sure you want to delete this transfer?')) {
      removeService('transfers', index);
    }
  };

  // Flight form handlers
  const handleFlightFormChange = (field, value) => {
    setFlightForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate margin
      if (field === 'sell_price' || field === 'cost_price') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const costPrice = parseFloat(updated.cost_price) || 0;
        updated.margin = sellPrice - costPrice;
      }

      return updated;
    });
  };

  const resetFlightForm = () => {
    setFlightForm({
      airline: '',
      flight_number: '',
      departure_date: '',
      arrival_date: '',
      from_airport: '',
      to_airport: '',
      pax_count: 1,
      cost_price: 0,
      sell_price: 0,
      margin: 0,
      payment_status: 'pending',
      paid_amount: 0,
      pnr: '',
      ticket_numbers: '',
      voucher_issued: false,
      notes: '',
    });
    setEditingFlightIndex(null);
  };

  const handleAddFlight = () => {
    setShowFlightForm(true);
    resetFlightForm();
  };

  const handleEditFlight = (index) => {
    setEditingFlightIndex(index);
    setFlightForm(services.flights[index]);
    setShowFlightForm(true);
  };

  const handleSaveFlight = () => {
    if (!flightForm.airline || !flightForm.flight_number || !flightForm.departure_date) {
      alert('Please fill in all required fields (Airline, Flight Number, Departure Date)');
      return;
    }

    if (editingFlightIndex !== null) {
      const updatedFlights = [...services.flights];
      updatedFlights[editingFlightIndex] = flightForm;
      setServices((prev) => ({ ...prev, flights: updatedFlights }));
    } else {
      addService('flights', flightForm);
    }

    setShowFlightForm(false);
    resetFlightForm();
  };

  const handleCancelFlightForm = () => {
    setShowFlightForm(false);
    resetFlightForm();
  };

  const handleDeleteFlight = (index) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      removeService('flights', index);
    }
  };

  const steps = [
    { number: 1, name: 'Basic Information' },
    { number: 2, name: 'Add Services' },
    { number: 3, name: 'Review & Submit' },
  ];

  const totals = calculateTotals();
  const selectedClient = clients.find((c) => c.id === parseInt(bookingData.client_id));

  // Show loading screen while fetching booking data in edit mode
  if (initialLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader text="Loading booking data..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            icon={ArrowLeftIcon}
            onClick={() => navigate('/bookings')}
          >
            Cancel
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? 'Edit Booking' : 'Create New Booking'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode
                ? 'Update booking details and services'
                : 'Fill in the details to create a new booking'}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card padding="normal">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${
                        currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }
                    `}
                  >
                    {currentStep > step.number ? (
                      <CheckIcon className="h-6 w-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-blue-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>

              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client *
                </label>
                <select
                  value={bookingData.client_id}
                  onChange={(e) => handleInputChange('client_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.client_id ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.client_type === 'agent' ? '(Agent)' : '(Direct)'}
                    </option>
                  ))}
                </select>
                {errors.client_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.client_id}</p>
                )}
                {selectedClient && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="text-slate-700">
                      <span className="font-medium">Type:</span> {selectedClient.type === 'agent' ? 'Tour Operator/Agent' : 'Direct Client'}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Email:</span> {selectedClient.email}
                    </p>
                    {selectedClient.phone && (
                      <p className="text-slate-700">
                        <span className="font-medium">Phone:</span> {selectedClient.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Traveler Information */}
              {selectedClient && selectedClient.type === 'agent' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-md font-medium text-slate-900">Traveler Information</h3>
                    <span className="ml-2 text-xs text-amber-600">(Actual passenger details)</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    This booking is from an agent. Please provide the actual traveler's details below.
                  </p>
                  <div>
                    <Input
                      type="text"
                      label="Traveler Name *"
                      value={bookingData.traveler_name}
                      onChange={(e) => handleInputChange('traveler_name', e.target.value)}
                      error={errors.traveler_name}
                      placeholder="Full name of the traveler"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      label="Traveler Email"
                      value={bookingData.traveler_email}
                      onChange={(e) => handleInputChange('traveler_email', e.target.value)}
                      placeholder="traveler@email.com"
                    />
                    <Input
                      type="tel"
                      label="Traveler Phone"
                      value={bookingData.traveler_phone}
                      onChange={(e) => handleInputChange('traveler_phone', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              )}

              {selectedClient && selectedClient.type === 'direct' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Direct Booking:</span> Client and traveler are the same person.
                  </p>
                </div>
              )}

              {/* Travel Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    label="Travel Start Date *"
                    value={bookingData.travel_date_from}
                    onChange={(e) => handleInputChange('travel_date_from', e.target.value)}
                    error={errors.travel_date_from}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    label="Travel End Date *"
                    value={bookingData.travel_date_to}
                    onChange={(e) => handleInputChange('travel_date_to', e.target.value)}
                    error={errors.travel_date_to}
                  />
                </div>
              </div>

              {/* PAX Count */}
              <div>
                <Input
                  type="number"
                  label="Number of Passengers (PAX) *"
                  value={bookingData.pax_count}
                  onChange={(e) => handleInputChange('pax_count', parseInt(e.target.value))}
                  error={errors.pax_count}
                  min="1"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Initial Status
                </label>
                <select
                  value={bookingData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={BOOKING_STATUS.INQUIRY}>Inquiry</option>
                  <option value={BOOKING_STATUS.QUOTED}>Quoted</option>
                  <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <Input
                  type="textarea"
                  label="Notes"
                  value={bookingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="4"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Add Services</h2>
                <div className="text-sm text-slate-600">
                  Total: {formatCurrency(totals.totalSell)} | Profit: {formatCurrency(totals.grossProfit)}
                </div>
              </div>

              {/* Service Tabs */}
              <div className="border-b border-blue-200">
                <div className="flex space-x-1">
                  {[
                    { key: 'hotels', label: 'Hotels', count: services.hotels.length },
                    { key: 'tours', label: 'Tours', count: services.tours.length },
                    { key: 'transfers', label: 'Transfers', count: services.transfers.length },
                    { key: 'flights', label: 'Flights', count: services.flights.length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveServiceTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeServiceTab === tab.key
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotels Tab */}
              {activeServiceTab === 'hotels' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-slate-900">Hotel Services</h3>
                    <Button icon={PlusIcon} onClick={handleAddHotel}>
                      Add Hotel
                    </Button>
                  </div>

                  {/* Hotel Form */}
                  {showHotelForm && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-slate-900">
                        {editingHotelIndex !== null ? 'Edit Hotel' : 'Add New Hotel'}
                      </h4>

                      {/* Hotel Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hotel *
                          </label>
                          <select
                            value={hotelForm.hotel_id}
                            onChange={(e) => handleHotelFormChange('hotel_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a hotel...</option>
                            {availableHotels.map((hotel) => (
                              <option key={hotel.id} value={hotel.id}>
                                {hotel.name} - {hotel.location}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Input
                            type="text"
                            label="Room Type"
                            value={hotelForm.room_type}
                            onChange={(e) => handleHotelFormChange('room_type', e.target.value)}
                            placeholder="e.g., Standard Double, Suite"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="date"
                            label="Check-in Date *"
                            value={hotelForm.check_in}
                            onChange={(e) => handleHotelFormChange('check_in', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="date"
                            label="Check-out Date *"
                            value={hotelForm.check_out}
                            onChange={(e) => handleHotelFormChange('check_out', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Nights"
                            value={hotelForm.nights}
                            readOnly
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Input
                            type="number"
                            label="Number of Rooms"
                            value={hotelForm.number_of_rooms}
                            onChange={(e) => handleHotelFormChange('number_of_rooms', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Cost per Night"
                            value={hotelForm.cost_per_night}
                            onChange={(e) => handleHotelFormChange('cost_per_night', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Total Cost"
                            value={hotelForm.total_cost}
                            readOnly
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Sell Price"
                            value={hotelForm.sell_price}
                            onChange={(e) => handleHotelFormChange('sell_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Margin Display */}
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase">Margin</p>
                        <p className={`text-lg font-bold ${hotelForm.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(hotelForm.margin)}
                        </p>
                      </div>

                      {/* Optional Fields (Collapsible) */}
                      <div className="border-t border-blue-300 pt-4 space-y-4">
                        <h5 className="text-sm font-medium text-slate-700">Payment Details (Optional)</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Payment Status
                            </label>
                            <select
                              value={hotelForm.payment_status}
                              onChange={(e) => handleHotelFormChange('payment_status', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              label="Paid Amount"
                              value={hotelForm.paid_amount}
                              onChange={(e) => handleHotelFormChange('paid_amount', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              label="Payment Due Date"
                              value={hotelForm.payment_due_date}
                              onChange={(e) => handleHotelFormChange('payment_due_date', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="text"
                              label="Confirmation Number"
                              value={hotelForm.confirmation_number}
                              onChange={(e) => handleHotelFormChange('confirmation_number', e.target.value)}
                              placeholder="Hotel confirmation code"
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <input
                              type="checkbox"
                              id="voucher_issued"
                              checked={hotelForm.voucher_issued}
                              onChange={(e) => handleHotelFormChange('voucher_issued', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="voucher_issued" className="ml-2 text-sm text-slate-700">
                              Voucher Issued
                            </label>
                          </div>
                        </div>

                        <div>
                          <Input
                            type="textarea"
                            label="Notes"
                            value={hotelForm.notes}
                            onChange={(e) => handleHotelFormChange('notes', e.target.value)}
                            rows="3"
                            placeholder="Any special notes or requests..."
                          />
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 pt-4 border-t border-blue-300">
                        <Button onClick={handleSaveHotel} icon={CheckIcon}>
                          {editingHotelIndex !== null ? 'Update Hotel' : 'Add Hotel'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelHotelForm}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Hotels List */}
                  {services.hotels.length > 0 ? (
                    <div className="space-y-3">
                      {services.hotels.map((hotel, index) => (
                        <div
                          key={index}
                          className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{hotel.hotel_name}</h4>
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Dates</p>
                                  <p className="text-slate-900">
                                    {formatDate(hotel.check_in)} - {formatDate(hotel.check_out)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Nights / Rooms</p>
                                  <p className="text-slate-900">
                                    {hotel.nights} nights / {hotel.number_of_rooms} rooms
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Room Type</p>
                                  <p className="text-slate-900">{hotel.room_type || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Cost / Sell / Margin</p>
                                  <p className="text-slate-900">
                                    {formatCurrency(hotel.total_cost)} / {formatCurrency(hotel.sell_price)} /
                                    <span className={hotel.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {' '}{formatCurrency(hotel.margin)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditHotel(index)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Hotel"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHotel(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Hotel"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showHotelForm && (
                      <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-slate-600 mb-4">No hotels added yet</p>
                        <Button icon={PlusIcon} onClick={handleAddHotel}>
                          Add Your First Hotel
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tours Tab */}
              {activeServiceTab === 'tours' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-slate-900">Tour Services</h3>
                    <Button icon={PlusIcon} onClick={handleAddTour}>
                      Add Tour
                    </Button>
                  </div>

                  {/* Tour Form */}
                  {showTourForm && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-slate-900">
                        {editingTourIndex !== null ? 'Edit Tour' : 'Add New Tour'}
                      </h4>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="text"
                            label="Tour Name *"
                            value={tourForm.tour_name}
                            onChange={(e) => handleTourFormChange('tour_name', e.target.value)}
                            placeholder="e.g., Cappadocia Hot Air Balloon"
                          />
                        </div>
                        <div>
                          <Input
                            type="date"
                            label="Tour Date *"
                            value={tourForm.tour_date}
                            onChange={(e) => handleTourFormChange('tour_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="Duration"
                            value={tourForm.duration}
                            onChange={(e) => handleTourFormChange('duration', e.target.value)}
                            placeholder="e.g., Full Day, 4 hours"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="number"
                            label="PAX Count"
                            value={tourForm.pax_count}
                            onChange={(e) => handleTourFormChange('pax_count', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Operation Type *
                          </label>
                          <select
                            value={tourForm.operation_type}
                            onChange={(e) => handleTourFormChange('operation_type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="supplier">With Supplier</option>
                            <option value="self-operated">Self-Operated</option>
                          </select>
                        </div>
                      </div>

                      {/* Supplier Fields */}
                      {tourForm.operation_type === 'supplier' && (
                        <div className="bg-white rounded-lg p-3 border border-green-300">
                          <h5 className="text-sm font-medium text-slate-700 mb-3">Supplier Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Supplier
                              </label>
                              <select
                                value={tourForm.supplier_id}
                                onChange={(e) => handleTourFormChange('supplier_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select supplier...</option>
                                {availableSuppliers.map((supplier) => (
                                  <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Input
                                type="number"
                                label="Supplier Cost"
                                value={tourForm.supplier_cost}
                                onChange={(e) => handleTourFormChange('supplier_cost', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Self-Operated Fields */}
                      {tourForm.operation_type === 'self-operated' && (
                        <div className="bg-white rounded-lg p-3 border border-green-300">
                          <h5 className="text-sm font-medium text-slate-700 mb-3">Self-Operated Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Guide
                              </label>
                              <select
                                value={tourForm.guide_id}
                                onChange={(e) => handleTourFormChange('guide_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select guide...</option>
                                {availableGuides.map((guide) => (
                                  <option key={guide.id} value={guide.id}>
                                    {guide.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Input
                                type="number"
                                label="Guide Cost"
                                value={tourForm.guide_cost}
                                onChange={(e) => handleTourFormChange('guide_cost', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Vehicle
                              </label>
                              <select
                                value={tourForm.vehicle_id}
                                onChange={(e) => handleTourFormChange('vehicle_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select vehicle...</option>
                                {availableVehicles.map((vehicle) => (
                                  <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.vehicle_type} - {vehicle.vehicle_number}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Input
                                type="number"
                                label="Vehicle Cost"
                                value={tourForm.vehicle_cost}
                                onChange={(e) => handleTourFormChange('vehicle_cost', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                label="Entrance Fees"
                                value={tourForm.entrance_fees}
                                onChange={(e) => handleTourFormChange('entrance_fees', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                label="Other Costs"
                                value={tourForm.other_costs}
                                onChange={(e) => handleTourFormChange('other_costs', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="number"
                            label="Total Cost"
                            value={tourForm.total_cost}
                            readOnly
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Sell Price"
                            value={tourForm.sell_price}
                            onChange={(e) => handleTourFormChange('sell_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Margin</label>
                          <div className="px-3 py-2 bg-gray-100 border border-slate-300 rounded-lg">
                            <span className={`font-bold ${tourForm.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(tourForm.margin)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Fields */}
                      <div className="border-t border-green-300 pt-4 space-y-4">
                        <h5 className="text-sm font-medium text-slate-700">Payment Details (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Payment Status
                            </label>
                            <select
                              value={tourForm.payment_status}
                              onChange={(e) => handleTourFormChange('payment_status', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              label="Paid Amount"
                              value={tourForm.paid_amount}
                              onChange={(e) => handleTourFormChange('paid_amount', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              label="Payment Due Date"
                              value={tourForm.payment_due_date}
                              onChange={(e) => handleTourFormChange('payment_due_date', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="text"
                              label="Confirmation Number"
                              value={tourForm.confirmation_number}
                              onChange={(e) => handleTourFormChange('confirmation_number', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <input
                              type="checkbox"
                              id="tour_voucher"
                              checked={tourForm.voucher_issued}
                              onChange={(e) => handleTourFormChange('voucher_issued', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="tour_voucher" className="ml-2 text-sm text-slate-700">
                              Voucher Issued
                            </label>
                          </div>
                        </div>
                        <div>
                          <Input
                            type="textarea"
                            label="Notes"
                            value={tourForm.notes}
                            onChange={(e) => handleTourFormChange('notes', e.target.value)}
                            rows="3"
                          />
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 pt-4 border-t border-green-300">
                        <Button onClick={handleSaveTour} icon={CheckIcon}>
                          {editingTourIndex !== null ? 'Update Tour' : 'Add Tour'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelTourForm}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tours List */}
                  {services.tours.length > 0 ? (
                    <div className="space-y-3">
                      {services.tours.map((tour, index) => (
                        <div
                          key={index}
                          className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{tour.tour_name}</h4>
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Date / Duration</p>
                                  <p className="text-slate-900">
                                    {formatDate(tour.tour_date)} {tour.duration && `/ ${tour.duration}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">PAX / Type</p>
                                  <p className="text-slate-900">
                                    {tour.pax_count} PAX / {tour.operation_type === 'supplier' ? 'Supplier' : 'Self-Op'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Cost / Sell</p>
                                  <p className="text-slate-900">
                                    {formatCurrency(tour.total_cost)} / {formatCurrency(tour.sell_price)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Margin</p>
                                  <p className={tour.margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {formatCurrency(tour.margin)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditTour(index)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit Tour"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTour(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Tour"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showTourForm && (
                      <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-slate-600 mb-4">No tours added yet</p>
                        <Button icon={PlusIcon} onClick={handleAddTour}>
                          Add Your First Tour
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Transfers Tab */}
              {activeServiceTab === 'transfers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-slate-900">Transfer Services</h3>
                    <Button icon={PlusIcon} onClick={handleAddTransfer}>
                      Add Transfer
                    </Button>
                  </div>

                  {/* Transfer Form */}
                  {showTransferForm && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-slate-900">
                        {editingTransferIndex !== null ? 'Edit Transfer' : 'Add New Transfer'}
                      </h4>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Transfer Type *
                          </label>
                          <select
                            value={transferForm.transfer_type}
                            onChange={(e) => handleTransferFormChange('transfer_type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Airport Pickup">Airport Pickup</option>
                            <option value="Airport Drop-off">Airport Drop-off</option>
                            <option value="Inter-city">Inter-city Transfer</option>
                            <option value="City Tour">City Tour Transport</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Input
                            type="date"
                            label="Transfer Date *"
                            value={transferForm.transfer_date}
                            onChange={(e) => handleTransferFormChange('transfer_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="PAX Count"
                            value={transferForm.pax_count}
                            onChange={(e) => handleTransferFormChange('pax_count', e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            label="From Location *"
                            value={transferForm.from_location}
                            onChange={(e) => handleTransferFormChange('from_location', e.target.value)}
                            placeholder="e.g., Istanbul Airport (IST)"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="To Location *"
                            value={transferForm.to_location}
                            onChange={(e) => handleTransferFormChange('to_location', e.target.value)}
                            placeholder="e.g., Sultanahmet Hotel"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            label="Vehicle Type"
                            value={transferForm.vehicle_type}
                            onChange={(e) => handleTransferFormChange('vehicle_type', e.target.value)}
                            placeholder="e.g., Sedan, Minivan, Bus"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Operation Type
                          </label>
                          <select
                            value={transferForm.operation_type}
                            onChange={(e) => handleTransferFormChange('operation_type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="supplier">With Supplier</option>
                            <option value="self-operated">Self-Operated</option>
                          </select>
                        </div>
                      </div>

                      {/* Conditional Fields */}
                      {transferForm.operation_type === 'supplier' && (
                        <div className="bg-white rounded-lg p-3 border border-purple-300">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Supplier
                          </label>
                          <select
                            value={transferForm.supplier_id}
                            onChange={(e) => handleTransferFormChange('supplier_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select supplier...</option>
                            {availableSuppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {transferForm.operation_type === 'self-operated' && (
                        <div className="bg-white rounded-lg p-3 border border-purple-300">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Vehicle
                          </label>
                          <select
                            value={transferForm.vehicle_id}
                            onChange={(e) => handleTransferFormChange('vehicle_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select vehicle...</option>
                            {availableVehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.vehicle_type} - {vehicle.vehicle_number}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="number"
                            label="Cost Price"
                            value={transferForm.cost_price}
                            onChange={(e) => handleTransferFormChange('cost_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Sell Price"
                            value={transferForm.sell_price}
                            onChange={(e) => handleTransferFormChange('sell_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Margin</label>
                          <div className="px-3 py-2 bg-gray-100 border border-slate-300 rounded-lg">
                            <span className={`font-bold ${transferForm.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(transferForm.margin)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Fields */}
                      <div className="border-t border-purple-300 pt-4 space-y-4">
                        <h5 className="text-sm font-medium text-slate-700">Payment Details (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Payment Status
                            </label>
                            <select
                              value={transferForm.payment_status}
                              onChange={(e) => handleTransferFormChange('payment_status', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              label="Paid Amount"
                              value={transferForm.paid_amount}
                              onChange={(e) => handleTransferFormChange('paid_amount', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              label="Confirmation Number"
                              value={transferForm.confirmation_number}
                              onChange={(e) => handleTransferFormChange('confirmation_number', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="transfer_voucher"
                              checked={transferForm.voucher_issued}
                              onChange={(e) => handleTransferFormChange('voucher_issued', e.target.checked)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="transfer_voucher" className="ml-2 text-sm text-slate-700">
                              Voucher Issued
                            </label>
                          </div>
                        </div>
                        <div>
                          <Input
                            type="textarea"
                            label="Notes"
                            value={transferForm.notes}
                            onChange={(e) => handleTransferFormChange('notes', e.target.value)}
                            rows="3"
                          />
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 pt-4 border-t border-purple-300">
                        <Button onClick={handleSaveTransfer} icon={CheckIcon}>
                          {editingTransferIndex !== null ? 'Update Transfer' : 'Add Transfer'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelTransferForm}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Transfers List */}
                  {services.transfers.length > 0 ? (
                    <div className="space-y-3">
                      {services.transfers.map((transfer, index) => (
                        <div
                          key={index}
                          className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{transfer.transfer_type}</h4>
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Date / PAX</p>
                                  <p className="text-slate-900">
                                    {formatDate(transfer.transfer_date)} / {transfer.pax_count} PAX
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Route</p>
                                  <p className="text-slate-900 truncate" title={`${transfer.from_location} → ${transfer.to_location}`}>
                                    {transfer.from_location} → {transfer.to_location}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Vehicle / Type</p>
                                  <p className="text-slate-900">
                                    {transfer.vehicle_type || 'N/A'} / {transfer.operation_type === 'supplier' ? 'Supplier' : 'Self-Op'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Cost / Sell / Margin</p>
                                  <p className="text-slate-900">
                                    {formatCurrency(transfer.cost_price)} / {formatCurrency(transfer.sell_price)} /
                                    <span className={transfer.margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {' '}{formatCurrency(transfer.margin)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditTransfer(index)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Edit Transfer"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransfer(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Transfer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showTransferForm && (
                      <div className="text-center py-8 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-slate-600 mb-4">No transfers added yet</p>
                        <Button icon={PlusIcon} onClick={handleAddTransfer}>
                          Add Your First Transfer
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Flights Tab */}
              {activeServiceTab === 'flights' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-slate-900">Flight Services</h3>
                    <Button icon={PlusIcon} onClick={handleAddFlight}>
                      Add Flight
                    </Button>
                  </div>

                  {/* Flight Form */}
                  {showFlightForm && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-slate-900">
                        {editingFlightIndex !== null ? 'Edit Flight' : 'Add New Flight'}
                      </h4>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="text"
                            label="Airline *"
                            value={flightForm.airline}
                            onChange={(e) => handleFlightFormChange('airline', e.target.value)}
                            placeholder="e.g., Turkish Airlines"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="Flight Number *"
                            value={flightForm.flight_number}
                            onChange={(e) => handleFlightFormChange('flight_number', e.target.value)}
                            placeholder="e.g., TK1234"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="PAX Count"
                            value={flightForm.pax_count}
                            onChange={(e) => handleFlightFormChange('pax_count', e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Airports */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            label="From Airport"
                            value={flightForm.from_airport}
                            onChange={(e) => handleFlightFormChange('from_airport', e.target.value)}
                            placeholder="e.g., IST (Istanbul)"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            label="To Airport"
                            value={flightForm.to_airport}
                            onChange={(e) => handleFlightFormChange('to_airport', e.target.value)}
                            placeholder="e.g., JFK (New York)"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="datetime-local"
                            label="Departure Date/Time *"
                            value={flightForm.departure_date}
                            onChange={(e) => handleFlightFormChange('departure_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="datetime-local"
                            label="Arrival Date/Time"
                            value={flightForm.arrival_date}
                            onChange={(e) => handleFlightFormChange('arrival_date', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            type="number"
                            label="Cost Price"
                            value={flightForm.cost_price}
                            onChange={(e) => handleFlightFormChange('cost_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            label="Sell Price"
                            value={flightForm.sell_price}
                            onChange={(e) => handleFlightFormChange('sell_price', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Margin</label>
                          <div className="px-3 py-2 bg-gray-100 border border-slate-300 rounded-lg">
                            <span className={`font-bold ${flightForm.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(flightForm.margin)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Fields */}
                      <div className="border-t border-orange-300 pt-4 space-y-4">
                        <h5 className="text-sm font-medium text-slate-700">Booking Details (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="text"
                              label="PNR (Booking Reference)"
                              value={flightForm.pnr}
                              onChange={(e) => handleFlightFormChange('pnr', e.target.value)}
                              placeholder="e.g., ABC123"
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              label="Ticket Numbers"
                              value={flightForm.ticket_numbers}
                              onChange={(e) => handleFlightFormChange('ticket_numbers', e.target.value)}
                              placeholder="e.g., 235-1234567890, 235-0987654321"
                            />
                          </div>
                        </div>

                        <h5 className="text-sm font-medium text-slate-700 mt-4">Payment Details (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Payment Status
                            </label>
                            <select
                              value={flightForm.payment_status}
                              onChange={(e) => handleFlightFormChange('payment_status', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              label="Paid Amount"
                              value={flightForm.paid_amount}
                              onChange={(e) => handleFlightFormChange('paid_amount', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <input
                              type="checkbox"
                              id="flight_voucher"
                              checked={flightForm.voucher_issued}
                              onChange={(e) => handleFlightFormChange('voucher_issued', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="flight_voucher" className="ml-2 text-sm text-slate-700">
                              E-Ticket Issued
                            </label>
                          </div>
                        </div>

                        <div>
                          <Input
                            type="textarea"
                            label="Notes"
                            value={flightForm.notes}
                            onChange={(e) => handleFlightFormChange('notes', e.target.value)}
                            rows="3"
                            placeholder="Baggage allowance, special requests, etc."
                          />
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 pt-4 border-t border-orange-300">
                        <Button onClick={handleSaveFlight} icon={CheckIcon}>
                          {editingFlightIndex !== null ? 'Update Flight' : 'Add Flight'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelFlightForm}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Flights List */}
                  {services.flights.length > 0 ? (
                    <div className="space-y-3">
                      {services.flights.map((flight, index) => (
                        <div
                          key={index}
                          className="bg-white border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">
                                {flight.airline} {flight.flight_number}
                              </h4>
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-500">Route</p>
                                  <p className="text-slate-900">
                                    {flight.from_airport} → {flight.to_airport}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Departure</p>
                                  <p className="text-slate-900">
                                    {formatDate(flight.departure_date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">PAX / PNR</p>
                                  <p className="text-slate-900">
                                    {flight.pax_count} PAX {flight.pnr && `/ ${flight.pnr}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Cost / Sell / Margin</p>
                                  <p className="text-slate-900">
                                    {formatCurrency(flight.cost_price)} / {formatCurrency(flight.sell_price)} /
                                    <span className={flight.margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {' '}{formatCurrency(flight.margin)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditFlight(index)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Edit Flight"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFlight(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Flight"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showFlightForm && (
                      <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-slate-600 mb-4">No flights added yet</p>
                        <Button icon={PlusIcon} onClick={handleAddFlight}>
                          Add Your First Flight
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Review & Submit</h2>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Client</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {selectedClient?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Travel Dates</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {formatDate(bookingData.travel_date_from)} - {formatDate(bookingData.travel_date_to)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Passengers</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {bookingData.pax_count} PAX
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Status</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 capitalize">
                      {bookingData.status}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-600 uppercase mb-1">Total Sell Price</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(totals.totalSell)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xs text-red-600 uppercase mb-1">Total Cost</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(totals.totalCost)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-green-600 uppercase mb-1">Gross Profit</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(totals.grossProfit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services Summary */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-3">Services</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{services.hotels.length}</p>
                      <p className="text-xs text-slate-600">Hotels</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{services.tours.length}</p>
                      <p className="text-xs text-slate-600">Tours</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{services.transfers.length}</p>
                      <p className="text-xs text-slate-600">Transfers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{services.flights.length}</p>
                      <p className="text-xs text-slate-600">Flights</p>
                    </div>
                  </div>
                </div>
              </div>

              {bookingData.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-2">Notes</p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{bookingData.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-blue-200">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => navigate('/bookings') : handleBack}
              icon={currentStep === 1 ? XMarkIcon : ArrowLeftIcon}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                iconPosition="right"
                icon={ArrowRightIcon}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                icon={CheckIcon}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isEditMode ? 'Update Booking' : 'Create Booking'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateBooking;
