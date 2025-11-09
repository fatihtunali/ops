import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal, CitySelect } from '@components/common';
import { tourSuppliersService } from '@services/tourSuppliersService';
import tourRatesService from '@services/tourRatesService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@context/ToastContext';
import { formatCurrency } from '@utils/formatters';

const TourSuppliersList = () => {
  const toast = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'rates'

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Supplier Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    payment_terms: '',
    notes: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rates state
  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [rateFilters, setRateFilters] = useState({
    supplier_id: '',
    city: '',
    tour_code: '',
    season_name: ''
  });

  // Rate Modal state
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormData, setRateFormData] = useState({
    tour_code: '',
    tour_name: '',
    supplier_id: '',
    supplier_name: '',
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    sic_rate: '',
    private_2pax_rate: '',
    private_4pax_rate: '',
    private_6pax_rate: '',
    private_8pax_rate: '',
    private_10pax_rate: '',
    notes: ''
  });
  const [rateFormErrors, setRateFormErrors] = useState({});
  const [submittingRate, setSubmittingRate] = useState(false);
  const [deletingRate, setDeletingRate] = useState(false);

  // Fetch suppliers
  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    } else if (activeTab === 'rates') {
      fetchRates();
    }
  }, [activeTab, currentPage, statusFilter, cityFilter, rateFilters]);

  // Fetch available cities on mount
  useEffect(() => {
    fetchAvailableCities();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchAvailableCities = async () => {
    try {
      const response = await tourSuppliersService.getCities();
      const data = response?.data || response;
      setAvailableCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.status = statusFilter;
      if (cityFilter) params.city = cityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await tourSuppliersService.getAll(params);
      const data = response?.data || response;

      if (data && Array.isArray(data.tour_suppliers || data)) {
        const allSuppliers = data.tour_suppliers || data;

        // Filter OUT vehicle suppliers (those with Daily Rental or Transfers)
        // Only show actual tour suppliers
        const tourOnlySuppliers = allSuppliers.filter(s => {
          if (!s.services_offered) return true; // Include if no services specified
          const services = s.services_offered.toLowerCase();
          // Exclude if it's a vehicle supplier
          return !(services.includes('daily rental') || services.includes('transfers'));
        });

        setSuppliers(tourOnlySuppliers);
        setTotalCount(tourOnlySuppliers.length);
        setTotalPages(Math.ceil(tourOnlySuppliers.length / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch tour suppliers:', err);
      setError('Failed to load tour suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      setLoadingRates(true);
      const response = await tourRatesService.getAll(rateFilters);
      const data = response?.data || response;
      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tour rates:', err);
      toast.error('Failed to load tour rates');
      setRates([]);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSuppliers();
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setSelectedCities([]);
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      payment_terms: '',
      notes: '',
      status: 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);

    // Parse service_areas string to array
    const cities = supplier.service_areas ? supplier.service_areas.split(',').map(c => c.trim()) : [];
    setSelectedCities(cities);

    setFormData({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      payment_terms: supplier.payment_terms || '',
      notes: supplier.notes || '',
      status: supplier.status || 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await tourSuppliersService.delete(supplier.id);
      toast.success('Tour supplier deleted successfully');
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to delete tour supplier:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete tour supplier. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Supplier name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Convert selectedCities array to comma-separated string
      const dataToSave = {
        ...formData,
        service_areas: selectedCities.join(', ')
      };

      if (editingSupplier) {
        await tourSuppliersService.update(editingSupplier.id, dataToSave);
        toast.success('Tour supplier updated successfully');
      } else {
        await tourSuppliersService.create(dataToSave);
        toast.success('Tour supplier created successfully');
      }

      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to save tour supplier:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to save tour supplier. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
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
      tour_code: '',
      tour_name: '',
      supplier_id: '',
      supplier_name: '',
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      sic_rate: '',
      private_2pax_rate: '',
      private_4pax_rate: '',
      private_6pax_rate: '',
      private_8pax_rate: '',
      private_10pax_rate: '',
      notes: ''
    });
    setRateFormErrors({});
    setShowRateModal(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      tour_code: rate.tour_code || '',
      tour_name: rate.tour_name || '',
      supplier_id: rate.supplier_id || '',
      supplier_name: rate.supplier_name || '',
      city: rate.city || '',
      season_name: rate.season_name || '',
      start_date: rate.start_date || '',
      end_date: rate.end_date || '',
      currency: rate.currency || 'EUR',
      sic_rate: rate.sic_rate || '',
      private_2pax_rate: rate.private_2pax_rate || '',
      private_4pax_rate: rate.private_4pax_rate || '',
      private_6pax_rate: rate.private_6pax_rate || '',
      private_8pax_rate: rate.private_8pax_rate || '',
      private_10pax_rate: rate.private_10pax_rate || '',
      notes: rate.notes || ''
    });
    setRateFormErrors({});
    setShowRateModal(true);
  };

  const handleDeleteRate = async (rate) => {
    if (!window.confirm(`Are you sure you want to delete rate for "${rate.tour_name}"?`)) {
      return;
    }

    setDeletingRate(true);
    try {
      await tourRatesService.delete(rate.id);
      toast.success('Tour rate deleted successfully');
      fetchRates();
    } catch (err) {
      console.error('Failed to delete tour rate:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete tour rate');
    } finally {
      setDeletingRate(false);
    }
  };

  const validateRateForm = () => {
    const errors = {};

    if (!rateFormData.tour_code?.trim()) errors.tour_code = 'Tour code is required';
    if (!rateFormData.tour_name?.trim()) errors.tour_name = 'Tour name is required';
    if (!rateFormData.supplier_id) errors.supplier_id = 'Supplier is required';
    if (!rateFormData.season_name?.trim()) errors.season_name = 'Season name is required';
    if (!rateFormData.start_date) errors.start_date = 'Start date is required';
    if (!rateFormData.end_date) errors.end_date = 'End date is required';

    // Validate at least one rate is provided
    const hasRate = rateFormData.sic_rate || rateFormData.private_2pax_rate ||
                    rateFormData.private_4pax_rate || rateFormData.private_6pax_rate ||
                    rateFormData.private_8pax_rate || rateFormData.private_10pax_rate;

    if (!hasRate) {
      errors.pricing = 'At least one rate must be specified';
    }

    setRateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRate = async (e) => {
    e.preventDefault();

    if (!validateRateForm()) {
      return;
    }

    setSubmittingRate(true);

    try {
      // Convert empty strings to null for numeric fields
      const dataToSave = {
        ...rateFormData,
        supplier_id: parseInt(rateFormData.supplier_id),
        sic_rate: rateFormData.sic_rate ? parseFloat(rateFormData.sic_rate) : null,
        private_2pax_rate: rateFormData.private_2pax_rate ? parseFloat(rateFormData.private_2pax_rate) : null,
        private_4pax_rate: rateFormData.private_4pax_rate ? parseFloat(rateFormData.private_4pax_rate) : null,
        private_6pax_rate: rateFormData.private_6pax_rate ? parseFloat(rateFormData.private_6pax_rate) : null,
        private_8pax_rate: rateFormData.private_8pax_rate ? parseFloat(rateFormData.private_8pax_rate) : null,
        private_10pax_rate: rateFormData.private_10pax_rate ? parseFloat(rateFormData.private_10pax_rate) : null
      };

      if (editingRate) {
        await tourRatesService.update(editingRate.id, dataToSave);
        toast.success('Tour rate updated successfully');
      } else {
        await tourRatesService.create(dataToSave);
        toast.success('Tour rate created successfully');
      }

      setShowRateModal(false);
      fetchRates();
    } catch (err) {
      console.error('Failed to save tour rate:', err);
      if (err.response?.data?.error?.code === 'CONFLICT') {
        setRateFormErrors({
          general: 'A rate already exists for this tour, supplier, and season combination'
        });
      } else {
        toast.error(err.response?.data?.error?.message || 'Failed to save tour rate');
      }
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleRateFormChange = (field, value) => {
    setRateFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill supplier_name when supplier changes
    if (field === 'supplier_id') {
      const supplier = suppliers.find(s => s.id === parseInt(value));
      if (supplier) {
        setRateFormData((prev) => ({
          ...prev,
          supplier_name: supplier.name
        }));
      }
    }

    // Clear error for this field
    if (rateFormErrors[field]) {
      setRateFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tour Management</h1>
            <p className="text-gray-600 mt-1">Manage tour suppliers and pricing</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rates
            </button>
          </nav>
        </div>

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <>
            {/* Search and Filters */}
            <Card>
              <div className="flex justify-between items-end gap-4">
                <form onSubmit={handleSearch} className="flex gap-4 items-end flex-1">
                  <div className="flex-1">
                    <Input
                      label="Search"
                      placeholder="Search by name, contact person..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={MagnifyingGlassIcon}
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                      value={cityFilter}
                      onChange={(e) => {
                        setCityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Cities</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit">Search</Button>
                </form>
                <Button icon={PlusIcon} onClick={handleAdd}>
                  Add Supplier
                </Button>
              </div>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <p className="text-red-600">{error}</p>
              </Card>
            )}

            {/* Suppliers List */}
            <Card>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-12">
                  <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first tour supplier.</p>
                  <Button icon={PlusIcon} onClick={handleAdd}>
                    Add Supplier
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Supplier Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Areas</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {suppliers.map((supplier) => (
                          <tr key={supplier.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                {supplier.contact_person && <div className="text-gray-900">{supplier.contact_person}</div>}
                                {supplier.phone && <div className="text-gray-600">{supplier.phone}</div>}
                                {supplier.email && <div className="text-gray-600">{supplier.email}</div>}
                                {!supplier.contact_person && !supplier.phone && !supplier.email && <span className="text-gray-400">-</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">
                                {supplier.service_areas || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={supplier.status === 'active' ? 'success' : 'secondary'}>
                                {supplier.status || 'active'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(supplier)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(supplier)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                  disabled={deleting}
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} suppliers
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          </>
        )}

        {/* Rates Tab */}
        {activeTab === 'rates' && (
          <>
            {/* Rate Filters */}
            <Card>
              <div className="flex gap-4 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select
                      value={rateFilters.supplier_id}
                      onChange={(e) => setRateFilters(prev => ({ ...prev, supplier_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Suppliers</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tour Code</label>
                    <input
                      type="text"
                      value={rateFilters.tour_code}
                      onChange={(e) => setRateFilters(prev => ({ ...prev, tour_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., IST-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={rateFilters.city}
                      onChange={(e) => setRateFilters(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <input
                      type="text"
                      value={rateFilters.season_name}
                      onChange={(e) => setRateFilters(prev => ({ ...prev, season_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Season"
                    />
                  </div>
                </div>
                <Button icon={PlusIcon} onClick={handleAddRate}>
                  Add Rate
                </Button>
              </div>
            </Card>

            {/* Rates List */}
            <Card>
              {loadingRates ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : rates.length === 0 ? (
                <div className="text-center py-12">
                  <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rates found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first tour rate.</p>
                  <Button icon={PlusIcon} onClick={handleAddRate}>
                    Add Rate
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tour Code</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tour Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Supplier</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">City</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Season</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SIC Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Private Rates</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{rate.tour_code}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">{rate.tour_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">{rate.supplier_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">{rate.city || '-'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">{rate.season_name}</div>
                            <div className="text-xs text-gray-500">{rate.start_date} - {rate.end_date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {rate.sic_rate ? formatCurrency(rate.sic_rate, rate.currency) : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs space-y-1">
                              {rate.private_2pax_rate && <div>2pax: {formatCurrency(rate.private_2pax_rate, rate.currency)}</div>}
                              {rate.private_4pax_rate && <div>4pax: {formatCurrency(rate.private_4pax_rate, rate.currency)}</div>}
                              {rate.private_6pax_rate && <div>6pax: {formatCurrency(rate.private_6pax_rate, rate.currency)}</div>}
                              {rate.private_8pax_rate && <div>8pax: {formatCurrency(rate.private_8pax_rate, rate.currency)}</div>}
                              {rate.private_10pax_rate && <div>10pax: {formatCurrency(rate.private_10pax_rate, rate.currency)}</div>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditRate(rate)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRate(rate)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                                disabled={deletingRate}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Add/Edit Supplier Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSupplier ? 'Edit Tour Supplier' : 'Add New Tour Supplier'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Supplier Name */}
            <Input
              label="Supplier Name *"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={formErrors.name}
              required
            />

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <Input
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => handleFormChange('contact_person', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  error={formErrors.email}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Service Areas */}
            <div className="border-t pt-4">
              <CitySelect
                label="Service Areas (Cities)"
                value={selectedCities}
                onChange={setSelectedCities}
                multiple
                placeholder="Select cities where this supplier operates..."
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <textarea
                value={formData.payment_terms}
                onChange={(e) => handleFormChange('payment_terms', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Net 30, 50% advance, payment on delivery..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add/Edit Rate Modal */}
        <Modal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          title={editingRate ? 'Edit Tour Rate' : 'Add New Tour Rate'}
          size="lg"
        >
          <form onSubmit={handleSubmitRate} className="space-y-4">
            {/* General Error */}
            {rateFormErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {rateFormErrors.general}
              </div>
            )}

            {/* Pricing Error */}
            {rateFormErrors.pricing && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                {rateFormErrors.pricing}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tour Code */}
              <Input
                label="Tour Code *"
                value={rateFormData.tour_code}
                onChange={(e) => handleRateFormChange('tour_code', e.target.value)}
                error={rateFormErrors.tour_code}
                placeholder="e.g., IST-01, CAP-02"
                required
              />

              {/* Tour Name */}
              <Input
                label="Tour Name *"
                value={rateFormData.tour_name}
                onChange={(e) => handleRateFormChange('tour_name', e.target.value)}
                error={rateFormErrors.tour_name}
                placeholder="e.g., Istanbul City Tour"
                required
              />

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={rateFormData.supplier_id}
                  onChange={(e) => handleRateFormChange('supplier_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    rateFormErrors.supplier_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
                {rateFormErrors.supplier_id && (
                  <p className="mt-1 text-sm text-red-500">{rateFormErrors.supplier_id}</p>
                )}
              </div>

              {/* City */}
              <CitySelect
                label="City"
                value={rateFormData.city}
                onChange={(value) => handleRateFormChange('city', value)}
                placeholder="Select city..."
              />

              {/* Season Name */}
              <Input
                label="Season Name *"
                value={rateFormData.season_name}
                onChange={(e) => handleRateFormChange('season_name', e.target.value)}
                error={rateFormErrors.season_name}
                placeholder="e.g., Winter 2025-26"
                required
              />

              {/* Start Date */}
              <Input
                label="Start Date *"
                type="date"
                value={rateFormData.start_date}
                onChange={(e) => handleRateFormChange('start_date', e.target.value)}
                error={rateFormErrors.start_date}
                required
              />

              {/* End Date */}
              <Input
                label="End Date *"
                type="date"
                value={rateFormData.end_date}
                onChange={(e) => handleRateFormChange('end_date', e.target.value)}
                error={rateFormErrors.end_date}
                required
              />

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={rateFormData.currency}
                  onChange={(e) => handleRateFormChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="TRY">TRY</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing (Per Person)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SIC Rate */}
                <Input
                  label="SIC Rate (Group Tour)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.sic_rate}
                  onChange={(e) => handleRateFormChange('sic_rate', e.target.value)}
                  placeholder="0.00"
                />

                {/* Private 2 pax */}
                <Input
                  label="Private 2 Pax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.private_2pax_rate}
                  onChange={(e) => handleRateFormChange('private_2pax_rate', e.target.value)}
                  placeholder="0.00"
                />

                {/* Private 4 pax */}
                <Input
                  label="Private 4 Pax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.private_4pax_rate}
                  onChange={(e) => handleRateFormChange('private_4pax_rate', e.target.value)}
                  placeholder="0.00"
                />

                {/* Private 6 pax */}
                <Input
                  label="Private 6 Pax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.private_6pax_rate}
                  onChange={(e) => handleRateFormChange('private_6pax_rate', e.target.value)}
                  placeholder="0.00"
                />

                {/* Private 8 pax */}
                <Input
                  label="Private 8 Pax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.private_8pax_rate}
                  onChange={(e) => handleRateFormChange('private_8pax_rate', e.target.value)}
                  placeholder="0.00"
                />

                {/* Private 10 pax */}
                <Input
                  label="Private 10 Pax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateFormData.private_10pax_rate}
                  onChange={(e) => handleRateFormChange('private_10pax_rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={rateFormData.notes}
                onChange={(e) => handleRateFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRateModal(false)}
                disabled={submittingRate}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingRate}>
                {submittingRate ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TourSuppliersList;
