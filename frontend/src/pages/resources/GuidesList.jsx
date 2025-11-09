import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { guidesService } from '@services/guidesService';
import guideRatesService from '@services/guideRatesService';
import CitySelect from '@components/common/CitySelect';
import { useToast } from '@context/ToastContext';
import { formatCurrency } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const GuidesList = () => {
  const toast = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState('guides');

  // Guides state
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Modal state for guides
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    languages: '',
    daily_rate: '',
    specialization: '',
    availability_status: 'available',
    service_areas: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Rates state
  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormData, setRateFormData] = useState({
    guide_id: '',
    guide_name: '',
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    daily_rate: '',
    night_rate: '',
    transfer_rate: '',
    package_rate_per_day: '',
    notes: '',
  });
  const [rateFormErrors, setRateFormErrors] = useState({});
  const [submittingRate, setSubmittingRate] = useState(false);

  // Fetch guides on mount and when filters change
  useEffect(() => {
    if (activeTab === 'guides') {
      fetchGuides();
    }
  }, [currentPage, statusFilter, activeTab]);

  // Fetch rates and guides when switching to rates tab
  useEffect(() => {
    if (activeTab === 'rates') {
      fetchRates();
      // Also fetch guides for the dropdown in rate form
      if (guides.length === 0) {
        fetchGuides();
      }
    }
  }, [activeTab]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.availability_status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await guidesService.getAll(params);
      const data = response?.data || response;

      if (data && Array.isArray(data.guides || data)) {
        setGuides(data.guides || data);
        setTotalCount(data.total || data.length);
        setTotalPages(Math.ceil((data.total || data.length) / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch guides:', err);
      setError('Failed to load guides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      console.log('Fetching guide rates...');
      setLoadingRates(true);
      const response = await guideRatesService.getAll();
      console.log('Guide rates response:', response);
      setRates(response.data || []);
      console.log('Rates set:', response.data || []);
    } catch (err) {
      console.error('Failed to fetch guide rates:', err);
      toast.error('Failed to load guide rates');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGuides();
  };

  const handleAdd = () => {
    setEditingGuide(null);
    setFormData({
      name: '',
      phone: '',
      languages: '',
      daily_rate: '',
      specialization: '',
      availability_status: 'available',
      service_areas: '',
      notes: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name || '',
      phone: guide.phone || '',
      languages: guide.languages || '',
      daily_rate: guide.daily_rate || '',
      specialization: guide.specialization || '',
      availability_status: guide.availability_status || 'available',
      service_areas: guide.service_areas || '',
      notes: guide.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (guide) => {
    if (!window.confirm(`Are you sure you want to delete "${guide.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await guidesService.delete(guide.id);
      toast.success('Guide deleted successfully');
      fetchGuides();
    } catch (err) {
      console.error('Failed to delete guide:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete guide. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Guide name is required';
    }

    if (formData.daily_rate && isNaN(formData.daily_rate)) {
      errors.daily_rate = 'Daily rate must be a number';
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
      const submitData = {
        ...formData,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
      };

      if (editingGuide) {
        await guidesService.update(editingGuide.id, submitData);
        toast.success('Guide updated successfully');
      } else {
        await guidesService.create(submitData);
        toast.success('Guide created successfully');
      }

      setShowModal(false);
      fetchGuides();
    } catch (err) {
      console.error('Failed to save guide:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to save guide. Please try again.';
      toast.error(errorMsg);
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

  // Rate management functions
  const handleAddRate = () => {
    setEditingRate(null);
    setRateFormData({
      guide_id: '',
      guide_name: '',
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      daily_rate: '',
      night_rate: '',
      transfer_rate: '',
      package_rate_per_day: '',
      notes: '',
    });
    setRateFormErrors({});
    setShowRateModal(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      guide_id: rate.guide_id || '',
      guide_name: rate.guide_name || '',
      city: rate.city || '',
      season_name: rate.season_name || '',
      start_date: rate.start_date || '',
      end_date: rate.end_date || '',
      currency: rate.currency || 'EUR',
      daily_rate: rate.daily_rate || '',
      night_rate: rate.night_rate || '',
      transfer_rate: rate.transfer_rate || '',
      package_rate_per_day: rate.package_rate_per_day || '',
      notes: rate.notes || '',
    });
    setRateFormErrors({});
    setShowRateModal(true);
  };

  const handleDeleteRate = async (rate) => {
    if (!window.confirm(`Are you sure you want to delete this rate for ${rate.guide_name}?`)) {
      return;
    }

    try {
      await guideRatesService.delete(rate.id);
      toast.success('Guide rate deleted successfully');
      fetchRates();
    } catch (err) {
      console.error('Failed to delete guide rate:', err);
      toast.error('Failed to delete guide rate');
    }
  };

  const validateRateForm = () => {
    const errors = {};

    if (!rateFormData.guide_id) {
      errors.guide_id = 'Guide is required';
    }
    if (!rateFormData.season_name?.trim()) {
      errors.season_name = 'Season name is required';
    }
    if (!rateFormData.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!rateFormData.end_date) {
      errors.end_date = 'End date is required';
    }

    // Check at least one rate is provided
    if (!rateFormData.daily_rate && !rateFormData.night_rate &&
        !rateFormData.transfer_rate && !rateFormData.package_rate_per_day) {
      errors.general = 'At least one rate must be provided';
    }

    setRateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();

    if (!validateRateForm()) {
      return;
    }

    setSubmittingRate(true);

    try {
      const submitData = {
        ...rateFormData,
        daily_rate: rateFormData.daily_rate ? parseFloat(rateFormData.daily_rate) : null,
        night_rate: rateFormData.night_rate ? parseFloat(rateFormData.night_rate) : null,
        transfer_rate: rateFormData.transfer_rate ? parseFloat(rateFormData.transfer_rate) : null,
        package_rate_per_day: rateFormData.package_rate_per_day ? parseFloat(rateFormData.package_rate_per_day) : null,
      };

      if (editingRate) {
        await guideRatesService.update(editingRate.id, submitData);
        toast.success('Guide rate updated successfully');
      } else {
        await guideRatesService.create(submitData);
        toast.success('Guide rate created successfully');
      }

      setShowRateModal(false);
      fetchRates();
    } catch (err) {
      console.error('Failed to save guide rate:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to save guide rate';
      toast.error(errorMsg);
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleRateFormChange = (field, value) => {
    setRateFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-fill guide name when guide is selected
      if (field === 'guide_id') {
        const selectedGuide = guides.find(g => g.id === parseInt(value));
        if (selectedGuide) {
          newData.guide_name = selectedGuide.name;
        }
      }

      return newData;
    });

    // Clear error for this field
    if (rateFormErrors[field]) {
      setRateFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'warning';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guides Management</h1>
            <p className="text-gray-600 mt-1">Manage tour guides, service areas, and seasonal rates</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Guides
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Rates
              </div>
            </button>
          </nav>
        </div>

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <>
            <div className="flex justify-end">
              <Button icon={PlusIcon} onClick={handleAdd}>
                Add Guide
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <form onSubmit={handleSearch} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Search"
                    placeholder="Search by name, languages, specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={MagnifyingGlassIcon}
                  />
                </div>
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
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

            {/* Guides List */}
            <Card>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : guides.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first guide.</p>
                  <Button icon={PlusIcon} onClick={handleAdd}>
                    Add Guide
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Languages</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Areas</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Specialization</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {guides.map((guide) => (
                          <tr key={guide.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{guide.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">
                                {guide.phone || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">
                                {guide.languages || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">
                                {guide.service_areas || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">
                                {guide.specialization || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getStatusVariant(guide.availability_status)}>
                                {guide.availability_status || 'available'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(guide)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(guide)}
                                  disabled={deleting}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} guides
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
            <div className="flex justify-end">
              <Button icon={PlusIcon} onClick={handleAddRate}>
                Add Rate
              </Button>
            </div>

            <Card>
              {loadingRates ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : rates.length === 0 ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rates found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding guide seasonal rates.</p>
                  <Button icon={PlusIcon} onClick={handleAddRate}>
                    Add Rate
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Guide</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">City</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Season</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dates</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Daily Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Night Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transfer Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Package/Day</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{rate.guide_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">{rate.city || '-'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">{rate.season_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {rate.start_date} to {rate.end_date}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {rate.daily_rate ? `${rate.currency} ${formatCurrency(rate.daily_rate)}` : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {rate.night_rate ? `${rate.currency} ${formatCurrency(rate.night_rate)}` : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {rate.transfer_rate ? `${rate.currency} ${formatCurrency(rate.transfer_rate)}` : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {rate.package_rate_per_day ? `${rate.currency} ${formatCurrency(rate.package_rate_per_day)}` : '-'}
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
              )}
            </Card>
          </>
        )}

        {/* Add/Edit Guide Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingGuide ? 'Edit Guide' : 'Add New Guide'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guide Name */}
            <Input
              label="Guide Name *"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={formErrors.name}
              required
            />

            {/* Phone */}
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
            />

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <Input
                placeholder="e.g., English, Turkish, Arabic"
                value={formData.languages}
                onChange={(e) => handleFormChange('languages', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of languages</p>
            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
              <CitySelect
                value={formData.service_areas}
                onChange={(value) => handleFormChange('service_areas', value)}
                placeholder="Select cities where guide operates..."
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">Cities/areas where the guide operates</p>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <Input
                placeholder="e.g., Historical, Adventure, Cultural"
                value={formData.specialization}
                onChange={(e) => handleFormChange('specialization', e.target.value)}
              />
            </div>

            {/* Daily Rate */}
            <Input
              label="Default Daily Rate"
              type="number"
              step="0.01"
              value={formData.daily_rate}
              onChange={(e) => handleFormChange('daily_rate', e.target.value)}
              error={formErrors.daily_rate}
            />

            {/* Availability Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
              <select
                value={formData.availability_status}
                onChange={(e) => handleFormChange('availability_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
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
                {submitting ? 'Saving...' : editingGuide ? 'Update Guide' : 'Add Guide'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add/Edit Rate Modal */}
        <Modal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          title={editingRate ? 'Edit Guide Rate' : 'Add New Guide Rate'}
          size="lg"
        >
          <form onSubmit={handleRateSubmit} className="space-y-4">
            {rateFormErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {rateFormErrors.general}
              </div>
            )}

            {/* Guide Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guide *</label>
              <select
                value={rateFormData.guide_id}
                onChange={(e) => handleRateFormChange('guide_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Guide</option>
                {guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
              </select>
              {rateFormErrors.guide_id && (
                <p className="text-red-600 text-sm mt-1">{rateFormErrors.guide_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <CitySelect
                  value={rateFormData.city}
                  onChange={(value) => handleRateFormChange('city', value)}
                  placeholder="Select city..."
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={rateFormData.currency}
                  onChange={(e) => handleRateFormChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="TRY">TRY</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Season Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season Name *</label>
                <Input
                  placeholder="e.g., Summer 2025"
                  value={rateFormData.season_name}
                  onChange={(e) => handleRateFormChange('season_name', e.target.value)}
                  error={rateFormErrors.season_name}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <Input
                  type="date"
                  value={rateFormData.start_date}
                  onChange={(e) => handleRateFormChange('start_date', e.target.value)}
                  error={rateFormErrors.start_date}
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <Input
                  type="date"
                  value={rateFormData.end_date}
                  onChange={(e) => handleRateFormChange('end_date', e.target.value)}
                  error={rateFormErrors.end_date}
                  required
                />
              </div>
            </div>

            {/* Rates Section */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Rates (provide at least one)</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Daily Rate */}
                <Input
                  label="Daily Rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={rateFormData.daily_rate}
                  onChange={(e) => handleRateFormChange('daily_rate', e.target.value)}
                />

                {/* Night Rate */}
                <Input
                  label="Night Rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={rateFormData.night_rate}
                  onChange={(e) => handleRateFormChange('night_rate', e.target.value)}
                />

                {/* Transfer Rate */}
                <Input
                  label="Transfer Rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={rateFormData.transfer_rate}
                  onChange={(e) => handleRateFormChange('transfer_rate', e.target.value)}
                />

                {/* Package Rate Per Day */}
                <Input
                  label="Package Rate/Day"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={rateFormData.package_rate_per_day}
                  onChange={(e) => handleRateFormChange('package_rate_per_day', e.target.value)}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
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

export default GuidesList;
