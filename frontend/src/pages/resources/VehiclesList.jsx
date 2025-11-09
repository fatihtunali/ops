import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal, CitySelect } from '@components/common';
import vehicleTypesService from '@services/vehicleTypesService';
import vehicleRatesService from '@services/vehicleRatesService';
import tourSuppliersService from '@services/tourSuppliersService';
import { useToast } from '@context/ToastContext';
import { formatCurrency } from '@utils/formatters';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

// Service types available for suppliers
const SERVICE_TYPES = [
  { id: 'daily_rental', label: 'Daily Rental' },
  { id: 'transfers', label: 'Transfers' },
];

const VehiclesList = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [allVehicleRates, setAllVehicleRates] = useState([]);
  const [loadingAllRates, setLoadingAllRates] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Supplier modal state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    payment_terms: '',
    notes: '',
    status: 'active',
  });
  const [supplierFormErrors, setSupplierFormErrors] = useState({});
  const [submittingSupplier, setSubmittingSupplier] = useState(false);

  // Rate form state
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormData, setRateFormData] = useState({
    city: '',
    supplier_id: '',
    supplier_name: '',
    season_name: '',
    start_date: '',
    end_date: '',
    vehicle_type_id: '',
    currency: 'EUR',
    full_day_price: '',
    half_day_price: '',
    airport_to_hotel: '',
    hotel_to_airport: '',
    round_trip: '',
    notes: ''
  });
  const [rateFormErrors, setRateFormErrors] = useState({});
  const [submittingRate, setSubmittingRate] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchVehicleTypes();
    fetchSuppliers();
    fetchRatesForVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const response = await vehicleTypesService.getAll();
      const types = Array.isArray(response) ? response : (response?.data || []);
      setVehicleTypes(types);
    } catch (err) {
      console.error('Failed to fetch vehicle types:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await tourSuppliersService.getAll();
      const suppliersList = Array.isArray(response) ? response : (response?.data || []);
      // Filter suppliers that offer Daily Rental or Transfers services
      const vehicleSuppliers = suppliersList.filter(s => {
        if (!s.services_offered) return false;
        const services = s.services_offered.toLowerCase();
        return services.includes('daily rental') || services.includes('transfers');
      });
      setSuppliers(vehicleSuppliers);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchRatesForVehicleTypes = async () => {
    try {
      setLoadingAllRates(true);
      const response = await vehicleRatesService.getAll();
      const rates = Array.isArray(response) ? response : (response?.data || []);
      setAllVehicleRates(rates);
    } catch (err) {
      console.error('Failed to fetch vehicle rates:', err);
      setAllVehicleRates([]);
    } finally {
      setLoadingAllRates(false);
    }
  };

  // Supplier handlers
  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setSelectedServices([]);
    setSelectedCities([]);
    setSupplierFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      payment_terms: '',
      notes: '',
      status: 'active',
    });
    setSupplierFormErrors({});
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);

    // Parse services_offered string to array
    const services = supplier.services_offered ? supplier.services_offered.split(',').map(s => s.trim()) : [];
    setSelectedServices(services);

    // Parse service_areas string to array
    const cities = supplier.service_areas ? supplier.service_areas.split(',').map(c => c.trim()) : [];
    setSelectedCities(cities);

    setSupplierFormData({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      payment_terms: supplier.payment_terms || '',
      notes: supplier.notes || '',
      status: supplier.status || 'active',
    });
    setSupplierFormErrors({});
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await tourSuppliersService.delete(supplier.id);
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
      fetchRatesForVehicleTypes();
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete supplier. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const validateSupplierForm = () => {
    const errors = {};

    if (!supplierFormData.name?.trim()) {
      errors.name = 'Supplier name is required';
    }

    if (selectedServices.length === 0) {
      errors.services = 'Please select at least one service type';
    }

    if (supplierFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierFormData.email)) {
      errors.email = 'Invalid email format';
    }

    setSupplierFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitSupplier = async (e) => {
    e.preventDefault();

    if (!validateSupplierForm()) {
      return;
    }

    setSubmittingSupplier(true);

    try {
      // Convert selectedServices and selectedCities arrays to comma-separated strings
      const dataToSave = {
        ...supplierFormData,
        services_offered: selectedServices.join(', '),
        service_areas: selectedCities.join(', ')
      };

      if (editingSupplier) {
        await tourSuppliersService.update(editingSupplier.id, dataToSave);
        toast.success('Supplier updated successfully');
      } else {
        await tourSuppliersService.create(dataToSave);
        toast.success('Supplier created successfully');
      }

      setShowSupplierModal(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to save supplier. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmittingSupplier(false);
    }
  };

  const handleSupplierFormChange = (field, value) => {
    setSupplierFormData((prev) => ({ ...prev, [field]: value }));

    if (supplierFormErrors[field]) {
      setSupplierFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Rate handlers
  const handleAddRate = () => {
    setEditingRate(null);
    setRateFormData({
      city: '',
      supplier_id: '',
      supplier_name: '',
      season_name: '',
      start_date: '',
      end_date: '',
      vehicle_type_id: '',
      currency: 'EUR',
      full_day_price: '',
      half_day_price: '',
      airport_to_hotel: '',
      hotel_to_airport: '',
      round_trip: '',
      notes: ''
    });
    setRateFormErrors({});
    setShowRateForm(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      city: rate.city || '',
      supplier_id: rate.supplier_id || '',
      supplier_name: rate.supplier_name || '',
      season_name: rate.season_name || '',
      start_date: rate.start_date || '',
      end_date: rate.end_date || '',
      vehicle_type_id: rate.vehicle_type_id || '',
      currency: rate.currency || 'EUR',
      full_day_price: rate.full_day_price || '',
      half_day_price: rate.half_day_price || '',
      airport_to_hotel: rate.airport_to_hotel || '',
      hotel_to_airport: rate.hotel_to_airport || '',
      round_trip: rate.round_trip || '',
      notes: rate.notes || ''
    });
    setRateFormErrors({});
    setShowRateForm(true);
  };

  const handleDeleteRate = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) {
      return;
    }

    setDeleting(true);
    try {
      await vehicleRatesService.delete(rateId);
      toast.success('Vehicle rate deleted successfully');
      await fetchRatesForVehicleTypes();
    } catch (err) {
      console.error('Failed to delete rate:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete rate. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const validateRateForm = () => {
    const errors = {};

    if (!rateFormData.city?.trim()) errors.city = 'City is required';
    if (!rateFormData.supplier_id) errors.supplier_id = 'Supplier is required';
    if (!rateFormData.season_name?.trim()) errors.season_name = 'Season name is required';
    if (!rateFormData.start_date) errors.start_date = 'Start date is required';
    if (!rateFormData.end_date) errors.end_date = 'End date is required';
    if (!rateFormData.vehicle_type_id) errors.vehicle_type_id = 'Vehicle type is required';

    if (rateFormData.start_date && rateFormData.end_date) {
      if (new Date(rateFormData.start_date) > new Date(rateFormData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }

    const hasPricing =
      rateFormData.full_day_price ||
      rateFormData.half_day_price ||
      rateFormData.airport_to_hotel ||
      rateFormData.hotel_to_airport ||
      rateFormData.round_trip;

    if (!hasPricing) {
      errors.pricing = 'At least one price must be specified';
    }

    setRateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRateFormChange = (field, value) => {
    setRateFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'supplier_id') {
      const supplier = suppliers.find(s => s.id === parseInt(value));
      if (supplier) {
        setRateFormData((prev) => ({ ...prev, supplier_name: supplier.name }));
      }
    }

    if (rateFormErrors[field]) {
      setRateFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmitRate = async (e) => {
    e.preventDefault();

    if (!validateRateForm()) {
      return;
    }

    setSubmittingRate(true);

    try {
      const dataToSave = {
        ...rateFormData,
        supplier_id: parseInt(rateFormData.supplier_id),
        vehicle_type_id: parseInt(rateFormData.vehicle_type_id),
        full_day_price: rateFormData.full_day_price ? parseFloat(rateFormData.full_day_price) : null,
        half_day_price: rateFormData.half_day_price ? parseFloat(rateFormData.half_day_price) : null,
        airport_to_hotel: rateFormData.airport_to_hotel ? parseFloat(rateFormData.airport_to_hotel) : null,
        hotel_to_airport: rateFormData.hotel_to_airport ? parseFloat(rateFormData.hotel_to_airport) : null,
        round_trip: rateFormData.round_trip ? parseFloat(rateFormData.round_trip) : null
      };

      if (editingRate) {
        await vehicleRatesService.update(editingRate.id, dataToSave);
        toast.success('Vehicle rate updated successfully');
      } else {
        await vehicleRatesService.create(dataToSave);
        toast.success('Vehicle rate created successfully');
      }

      setShowRateForm(false);
      await fetchRatesForVehicleTypes();
    } catch (err) {
      console.error('Failed to save rate:', err);
      const errorMsg = err.response?.data?.error?.code === 'CONFLICT'
        ? 'A rate already exists for this city, supplier, season, and vehicle type combination'
        : (err.response?.data?.error?.message || 'Failed to save rate');
      toast.error(errorMsg);
    } finally {
      setSubmittingRate(false);
    }
  };

  const getStatusVariant = (status) => {
    return status === 'active' ? 'success' : 'secondary';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles & Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage vehicle suppliers and pricing</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Vehicle Suppliers
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`${
                activeTab === 'rates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Vehicle Rates
            </button>
          </nav>
        </div>

        {/* Tab 1: Suppliers */}
        {activeTab === 'suppliers' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle & Transfer Suppliers</h2>
                <p className="text-sm text-gray-600">Manage companies providing vehicles and transfers</p>
              </div>
              <Button icon={PlusIcon} onClick={handleAddSupplier}>
                Add Supplier
              </Button>
            </div>

            {loadingSuppliers ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No vehicle suppliers found.</p>
                <Button icon={PlusIcon} onClick={handleAddSupplier}>
                  Add First Supplier
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Services</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact Person</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {suppliers.map((supplier) => {
                      const services = supplier.services_offered
                        ? supplier.services_offered.split(',').map(s => s.trim())
                        : [];

                      return (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{supplier.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {services.length > 0 ? (
                                services.map((service, index) => (
                                  <Badge key={index} variant="primary">
                                    {service}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {supplier.contact_person || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {supplier.email || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {supplier.phone || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusVariant(supplier.status)}>
                              {supplier.status || 'active'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditSupplier(supplier)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(supplier)}
                                disabled={deleting}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: Rates */}
        {activeTab === 'rates' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Rates</h2>
                <p className="text-sm text-gray-600">All seasonal rates for vehicle types</p>
              </div>
              <Button icon={PlusIcon} onClick={handleAddRate}>
                Add Rate
              </Button>
            </div>

            {loadingAllRates ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : allVehicleRates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No vehicle rates found.</p>
                <Button icon={PlusIcon} onClick={handleAddRate}>
                  Add First Rate
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Supplier</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Vehicle Type</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Max Capacity</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">City</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Season Name</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Start Date</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">End Date</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Currency</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Full Day</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Half Day</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Airport→Hotel</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Hotel→Airport</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Round Trip</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Notes</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allVehicleRates.map((rate) => {
                      const vType = vehicleTypes.find(vt => vt.id === rate.vehicle_type_id);
                      return (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-xs text-gray-900">{rate.supplier_name || '-'}</td>
                          <td className="py-2 px-3 text-xs font-medium text-gray-900">{vType?.name || '-'}</td>
                          <td className="py-2 px-3 text-xs text-gray-600">{vType?.max_capacity || '-'}</td>
                          <td className="py-2 px-3 text-xs text-gray-900">{rate.city || '-'}</td>
                          <td className="py-2 px-3 text-xs font-medium text-gray-900">{rate.season_name || '-'}</td>
                          <td className="py-2 px-3 text-xs text-gray-600">
                            {rate.start_date ? new Date(rate.start_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-600">
                            {rate.end_date ? new Date(rate.end_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {rate.currency}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {rate.full_day_price ? formatCurrency(rate.full_day_price, rate.currency) : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {rate.half_day_price ? formatCurrency(rate.half_day_price, rate.currency) : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {rate.airport_to_hotel ? formatCurrency(rate.airport_to_hotel, rate.currency) : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {rate.hotel_to_airport ? formatCurrency(rate.hotel_to_airport, rate.currency) : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900">
                            {rate.round_trip ? formatCurrency(rate.round_trip, rate.currency) : '-'}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-600 max-w-xs truncate">
                            {rate.notes || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEditRate(rate)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRate(rate.id)}
                                disabled={deleting}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Supplier Modal */}
        <Modal
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        >
          <form onSubmit={handleSubmitSupplier} className="space-y-4">
            <Input
              label="Supplier Name *"
              value={supplierFormData.name}
              onChange={(e) => handleSupplierFormChange('name', e.target.value)}
              error={supplierFormErrors.name}
              required
            />

            {/* Service Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Types <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="space-y-2">
                  {SERVICE_TYPES.map((serviceType) => (
                    <label
                      key={serviceType.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(serviceType.label)}
                        onChange={() => handleServiceToggle(serviceType.label)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{serviceType.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <Badge key={service} variant="primary">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
              {supplierFormErrors.services && (
                <p className="mt-1 text-sm text-red-500">{supplierFormErrors.services}</p>
              )}
            </div>

            {/* Service Areas/Cities */}
            <CitySelect
              label="Service Areas (Cities)"
              value={selectedCities}
              onChange={setSelectedCities}
              multiple
              placeholder="Select cities where this supplier operates..."
            />

            <Input
              label="Contact Person"
              value={supplierFormData.contact_person}
              onChange={(e) => handleSupplierFormChange('contact_person', e.target.value)}
            />

            <Input
              label="Email"
              type="email"
              value={supplierFormData.email}
              onChange={(e) => handleSupplierFormChange('email', e.target.value)}
              error={supplierFormErrors.email}
            />

            <Input
              label="Phone"
              value={supplierFormData.phone}
              onChange={(e) => handleSupplierFormChange('phone', e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <textarea
                value={supplierFormData.payment_terms}
                onChange={(e) => handleSupplierFormChange('payment_terms', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Net 30, 50% advance, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={supplierFormData.status}
                onChange={(e) => handleSupplierFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={supplierFormData.notes}
                onChange={(e) => handleSupplierFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSupplierModal(false)}
                disabled={submittingSupplier}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingSupplier}>
                {submittingSupplier ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Rate Form Modal */}
        {showRateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingRate ? 'Edit Rate' : 'Add New Rate'}
                </h3>
              </div>

              <form onSubmit={handleSubmitRate} className="px-6 py-4">
                {rateFormErrors.general && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {rateFormErrors.general}
                  </div>
                )}

                {rateFormErrors.pricing && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                    {rateFormErrors.pricing}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CitySelect
                    label="City"
                    value={rateFormData.city}
                    onChange={(value) => handleRateFormChange('city', value)}
                    error={rateFormErrors.city}
                    required
                    placeholder="Select city..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rateFormData.supplier_id}
                      onChange={(e) => handleRateFormChange('supplier_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rateFormErrors.supplier_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {rateFormErrors.supplier_id && (
                      <p className="mt-1 text-sm text-red-500">{rateFormErrors.supplier_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rateFormData.vehicle_type_id}
                      onChange={(e) => handleRateFormChange('vehicle_type_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rateFormErrors.vehicle_type_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map((vType) => (
                        <option key={vType.id} value={vType.id}>
                          {vType.name} ({vType.max_capacity} pax)
                        </option>
                      ))}
                    </select>
                    {rateFormErrors.vehicle_type_id && (
                      <p className="mt-1 text-sm text-red-500">{rateFormErrors.vehicle_type_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rateFormData.season_name}
                      onChange={(e) => handleRateFormChange('season_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rateFormErrors.season_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Winter 2025-26"
                    />
                    {rateFormErrors.season_name && (
                      <p className="mt-1 text-sm text-red-500">{rateFormErrors.season_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={rateFormData.currency}
                      onChange={(e) => handleRateFormChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rateFormData.start_date}
                      onChange={(e) => handleRateFormChange('start_date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rateFormErrors.start_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {rateFormErrors.start_date && (
                      <p className="mt-1 text-sm text-red-500">{rateFormErrors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rateFormData.end_date}
                      onChange={(e) => handleRateFormChange('end_date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        rateFormErrors.end_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {rateFormErrors.end_date && (
                      <p className="mt-1 text-sm text-red-500">{rateFormErrors.end_date}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Day Price
                      </label>
                      <input
                        type="number"
                        value={rateFormData.full_day_price}
                        onChange={(e) => handleRateFormChange('full_day_price', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Half Day Price
                      </label>
                      <input
                        type="number"
                        value={rateFormData.half_day_price}
                        onChange={(e) => handleRateFormChange('half_day_price', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Airport → Hotel
                      </label>
                      <input
                        type="number"
                        value={rateFormData.airport_to_hotel}
                        onChange={(e) => handleRateFormChange('airport_to_hotel', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotel → Airport
                      </label>
                      <input
                        type="number"
                        value={rateFormData.hotel_to_airport}
                        onChange={(e) => handleRateFormChange('hotel_to_airport', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Round Trip
                      </label>
                      <input
                        type="number"
                        value={rateFormData.round_trip}
                        onChange={(e) => handleRateFormChange('round_trip', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={rateFormData.notes}
                    onChange={(e) => handleRateFormChange('notes', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={submittingRate}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    disabled={submittingRate}
                  >
                    {submittingRate ? 'Saving...' : (editingRate ? 'Update Rate' : 'Add Rate')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VehiclesList;
