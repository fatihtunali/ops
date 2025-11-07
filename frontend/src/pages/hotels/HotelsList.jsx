import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { hotelsService } from '@services/hotelsService';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Seasonal rates modal state
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [seasonalRates, setSeasonalRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormData, setRateFormData] = useState({
    season_name: '',
    valid_from: '',
    valid_to: '',
    price_per_person_double: '',
    price_single_supplement: '',
    price_per_person_triple: '',
    price_child_0_2: '',
    price_child_3_5: '',
    price_child_6_11: '',
    notes: '',
  });

  // Rates for all hotels (for display in table)
  const [hotelRates, setHotelRates] = useState({});

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, [currentPage, statusFilter]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await hotelsService.getAll(params);
      const data = response?.data || response;

      if (data && Array.isArray(data.hotels || data)) {
        const hotelsList = data.hotels || data;
        setHotels(hotelsList);
        setTotalCount(data.total || hotelsList.length);
        setTotalPages(Math.ceil((data.total || hotelsList.length) / itemsPerPage));

        // Fetch rates for all hotels
        fetchRatesForHotels(hotelsList);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatesForHotels = async (hotelsList) => {
    try {
      const ratesPromises = hotelsList.map(async (hotel) => {
        try {
          const response = await hotelsService.getSeasonalRates(hotel.id);
          const data = response?.data || response;
          return { hotelId: hotel.id, rates: Array.isArray(data) ? data : data.data || [] };
        } catch (err) {
          console.error(`Failed to fetch rates for hotel ${hotel.id}:`, err);
          return { hotelId: hotel.id, rates: [] };
        }
      });

      const results = await Promise.all(ratesPromises);
      const ratesMap = {};
      results.forEach(({ hotelId, rates }) => {
        ratesMap[hotelId] = rates;
      });
      setHotelRates(ratesMap);
    } catch (err) {
      console.error('Failed to fetch hotel rates:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHotels();
  };

  const handleAdd = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      city: '',
      country: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
      status: 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || '',
      city: hotel.city || '',
      country: hotel.country || '',
      contact_person: hotel.contact_person || '',
      contact_email: hotel.contact_email || '',
      contact_phone: hotel.contact_phone || '',
      notes: hotel.notes || '',
      status: hotel.status || 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleManageRates = async (hotel) => {
    setSelectedHotel(hotel);
    setShowRatesModal(true);
    setShowRateForm(false);
    await fetchSeasonalRates(hotel.id);
  };

  const fetchSeasonalRates = async (hotelId) => {
    try {
      setLoadingRates(true);
      const response = await hotelsService.getSeasonalRates(hotelId);
      const data = response?.data || response;
      setSeasonalRates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch seasonal rates:', err);
      alert('Failed to load seasonal rates');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleAddRate = () => {
    setEditingRate(null);
    setRateFormData({
      season_name: '',
      valid_from: '',
      valid_to: '',
      price_per_person_double: '',
      price_single_supplement: '',
      price_per_person_triple: '',
      price_child_0_2: '',
      price_child_3_5: '',
      price_child_6_11: '',
      notes: '',
    });
    setShowRateForm(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      season_name: rate.season_name || '',
      valid_from: rate.valid_from || '',
      valid_to: rate.valid_to || '',
      price_per_person_double: rate.price_per_person_double || '',
      price_single_supplement: rate.price_single_supplement || '',
      price_per_person_triple: rate.price_per_person_triple || '',
      price_child_0_2: rate.price_child_0_2 || '',
      price_child_3_5: rate.price_child_3_5 || '',
      price_child_6_11: rate.price_child_6_11 || '',
      notes: rate.notes || '',
    });
    setShowRateForm(true);
  };

  const handleDeleteRate = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this seasonal rate?')) {
      return;
    }

    try {
      await hotelsService.deleteSeasonalRate(selectedHotel.id, rateId);
      await fetchSeasonalRates(selectedHotel.id);
    } catch (err) {
      console.error('Failed to delete rate:', err);
      alert('Failed to delete rate');
    }
  };

  const handleSubmitRate = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const submitData = {
        ...rateFormData,
        price_per_person_double: rateFormData.price_per_person_double ? parseFloat(rateFormData.price_per_person_double) : null,
        price_single_supplement: rateFormData.price_single_supplement ? parseFloat(rateFormData.price_single_supplement) : null,
        price_per_person_triple: rateFormData.price_per_person_triple ? parseFloat(rateFormData.price_per_person_triple) : null,
        price_child_0_2: rateFormData.price_child_0_2 ? parseFloat(rateFormData.price_child_0_2) : null,
        price_child_3_5: rateFormData.price_child_3_5 ? parseFloat(rateFormData.price_child_3_5) : null,
        price_child_6_11: rateFormData.price_child_6_11 ? parseFloat(rateFormData.price_child_6_11) : null,
      };

      if (editingRate) {
        await hotelsService.updateSeasonalRate(selectedHotel.id, editingRate.id, submitData);
      } else {
        await hotelsService.createSeasonalRate(selectedHotel.id, submitData);
      }

      setShowRateForm(false);
      await fetchSeasonalRates(selectedHotel.id);
    } catch (err) {
      console.error('Failed to save rate:', err);
      alert(err.response?.data?.error?.message || 'Failed to save rate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Are you sure you want to delete "${hotel.name}"?`)) {
      return;
    }

    try {
      await hotelsService.delete(hotel.id);
      fetchHotels();
    } catch (err) {
      console.error('Failed to delete hotel:', err);
      alert('Failed to delete hotel. Please try again.');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Hotel name is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = 'Invalid email format';
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
      if (editingHotel) {
        await hotelsService.update(editingHotel.id, formData);
      } else {
        await hotelsService.create(formData);
      }

      setShowModal(false);
      fetchHotels();
    } catch (err) {
      console.error('Failed to save hotel:', err);
      alert('Failed to save hotel. Please try again.');
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotels Management</h1>
            <p className="text-gray-600 mt-1">Manage hotel inventory and contact information</p>
          </div>
          <Button icon={PlusIcon} onClick={handleAdd}>
            Add Hotel
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by name, city, or country..."
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
            <Button type="submit">Search</Button>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Hotels List */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first hotel.</p>
              <Button icon={PlusIcon} onClick={handleAdd}>
                Add Hotel
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hotel Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Seasonal Rates</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hotels.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{hotel.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {hotel.city && hotel.country
                              ? `${hotel.city}, ${hotel.country}`
                              : hotel.city || hotel.country || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs space-y-1">
                            {hotelRates[hotel.id] && hotelRates[hotel.id].length > 0 ? (
                              hotelRates[hotel.id].map((rate) => (
                                <div key={rate.id} className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0">
                                  <span className="font-medium text-gray-700 min-w-[120px]">{rate.season_name}</span>
                                  <span className="text-gray-500 text-[10px]">
                                    {formatDate(rate.valid_from)} - {formatDate(rate.valid_to)}
                                  </span>
                                  <span className="ml-auto text-blue-600 font-semibold">
                                    PP DBL: {rate.price_per_person_double ? formatCurrency(rate.price_per_person_double) : '-'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">No rates set</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={hotel.status === 'active' ? 'success' : 'secondary'}>
                            {hotel.status || 'active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleManageRates(hotel)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Manage Seasonal Rates"
                            >
                              <CurrencyDollarIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(hotel)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(hotel)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} hotels
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

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hotel Name */}
            <Input
              label="Hotel Name *"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={formErrors.name}
              required
            />

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => handleFormChange('country', e.target.value)}
              />
            </div>

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
                  value={formData.contact_email}
                  onChange={(e) => handleFormChange('contact_email', e.target.value)}
                  error={formErrors.contact_email}
                />
                <Input
                  label="Phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleFormChange('contact_phone', e.target.value)}
                />
              </div>
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
                placeholder="Additional notes or special instructions..."
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
                {submitting ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Add Hotel'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Seasonal Rates Modal */}
        <Modal
          isOpen={showRatesModal}
          onClose={() => {
            setShowRatesModal(false);
            setShowRateForm(false);
          }}
          title={selectedHotel ? `Seasonal Rates - ${selectedHotel.name}` : 'Seasonal Rates'}
          size="xl"
        >
          {!showRateForm ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Manage pricing for different seasons and periods
                </p>
                <Button icon={PlusIcon} onClick={handleAddRate} size="sm">
                  Add Rate Period
                </Button>
              </div>

              {/* Rates List */}
              {loadingRates ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : seasonalRates.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No seasonal rates</h3>
                  <p className="text-sm text-gray-500 mb-4">Add your first rate period to get started.</p>
                  <Button icon={PlusIcon} onClick={handleAddRate} size="sm">
                    Add Rate Period
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {seasonalRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{rate.season_name}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(rate.valid_from)} to {formatDate(rate.valid_to)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRate(rate)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Per Person (DBL)</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_per_person_double ? formatCurrency(rate.price_per_person_double) : '-'}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Single Supplement</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_single_supplement ? formatCurrency(rate.price_single_supplement) : '-'}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Per Person (TRP)</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_per_person_triple ? formatCurrency(rate.price_per_person_triple) : '-'}
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Child 0-2.99</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_child_0_2 ? formatCurrency(rate.price_child_0_2) : '-'}
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Child 3-5.99</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_child_3_5 ? formatCurrency(rate.price_child_3_5) : '-'}
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Child 6-11.99</div>
                          <div className="font-medium text-gray-900">
                            {rate.price_child_6_11 ? formatCurrency(rate.price_child_6_11) : '-'}
                          </div>
                        </div>
                      </div>

                      {rate.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">{rate.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Rate Form
            <form onSubmit={handleSubmitRate} className="space-y-4">
              {/* Season Name */}
              <Input
                label="Season Name *"
                value={rateFormData.season_name}
                onChange={(e) => setRateFormData({ ...rateFormData, season_name: e.target.value })}
                placeholder="e.g., Summer 2025, High Season"
                required
              />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valid From *"
                  type="date"
                  value={rateFormData.valid_from}
                  onChange={(e) => setRateFormData({ ...rateFormData, valid_from: e.target.value })}
                  required
                />
                <Input
                  label="Valid To *"
                  type="date"
                  value={rateFormData.valid_to}
                  onChange={(e) => setRateFormData({ ...rateFormData, valid_to: e.target.value })}
                  required
                />
              </div>

              {/* Adult Pricing */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Adult Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Per Person (DBL)"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_per_person_double}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_per_person_double: e.target.value })}
                    placeholder="0.00"
                  />
                  <Input
                    label="Single Supplement"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_single_supplement}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_single_supplement: e.target.value })}
                    placeholder="0.00"
                  />
                  <Input
                    label="Per Person (TRP)"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_per_person_triple}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_per_person_triple: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Child Pricing */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Child Pricing (with 2 adults)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Child 0-2.99 years"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_child_0_2}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_child_0_2: e.target.value })}
                    placeholder="0.00"
                  />
                  <Input
                    label="Child 3-5.99 years"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_child_3_5}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_child_3_5: e.target.value })}
                    placeholder="0.00"
                  />
                  <Input
                    label="Child 6-11.99 years"
                    type="number"
                    step="0.01"
                    value={rateFormData.price_child_6_11}
                    onChange={(e) => setRateFormData({ ...rateFormData, price_child_6_11: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={rateFormData.notes}
                  onChange={(e) => setRateFormData({ ...rateFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRateForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default HotelsList;
