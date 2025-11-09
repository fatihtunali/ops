import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal, CitySelect } from '@components/common';
import entranceFeesService from '@services/entranceFeesService';
import { useToast } from '@context/ToastContext';
import { formatCurrency } from '@utils/formatters';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const EntranceFeesList = () => {
  const toast = useToast();
  const [entranceFees, setEntranceFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter state
  const [cityFilter, setCityFilter] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    attraction_name: '',
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    adult_rate: '',
    child_rate: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchEntranceFees();
    fetchAvailableCities();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchEntranceFees();
  }, [cityFilter]);

  const fetchEntranceFees = async () => {
    try {
      setLoading(true);
      const params = {
        is_active: true
      };
      if (cityFilter) {
        params.city = cityFilter;
      }
      const response = await entranceFeesService.getAll(params);
      const fees = Array.isArray(response) ? response : (response?.data || []);
      setEntranceFees(fees);
    } catch (err) {
      console.error('Failed to fetch entrance fees:', err);
      setEntranceFees([]);
      toast.error('Failed to load entrance fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCities = async () => {
    try {
      const response = await entranceFeesService.getCities();
      const data = response?.data || response;
      setAvailableCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  const handleAdd = () => {
    setEditingFee(null);
    setFormData({
      attraction_name: '',
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      adult_rate: '',
      child_rate: '',
      notes: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      attraction_name: fee.attraction_name || '',
      city: fee.city || '',
      season_name: fee.season_name || '',
      start_date: fee.start_date || '',
      end_date: fee.end_date || '',
      currency: fee.currency || 'EUR',
      adult_rate: fee.adult_rate || '',
      child_rate: fee.child_rate || '',
      notes: fee.notes || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (fee) => {
    if (!window.confirm(`Are you sure you want to delete entrance fee for "${fee.attraction_name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await entranceFeesService.delete(fee.id);
      toast.success('Entrance fee deleted successfully');
      fetchEntranceFees();
      fetchAvailableCities();
    } catch (err) {
      console.error('Failed to delete entrance fee:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete entrance fee. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.attraction_name?.trim()) {
      errors.attraction_name = 'Attraction name is required';
    }

    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.season_name?.trim()) {
      errors.season_name = 'Season name is required';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }

    if (!formData.adult_rate || parseFloat(formData.adult_rate) <= 0) {
      errors.adult_rate = 'Adult rate is required and must be greater than 0';
    }

    if (!formData.child_rate || parseFloat(formData.child_rate) <= 0) {
      errors.child_rate = 'Child rate is required and must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        adult_rate: parseFloat(formData.adult_rate),
        child_rate: parseFloat(formData.child_rate)
      };

      if (editingFee) {
        await entranceFeesService.update(editingFee.id, dataToSave);
        toast.success('Entrance fee updated successfully');
      } else {
        await entranceFeesService.create(dataToSave);
        toast.success('Entrance fee created successfully');
      }

      setShowModal(false);
      fetchEntranceFees();
      fetchAvailableCities();
    } catch (err) {
      console.error('Failed to save entrance fee:', err);
      const errorMsg = err.response?.data?.error?.code === 'DUPLICATE_ERROR'
        ? 'An entrance fee already exists for this attraction, city, season, and date range'
        : (err.response?.data?.error?.message || 'Failed to save entrance fee');
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter entrance fees by search term
  const filteredFees = entranceFees.filter(fee => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      fee.attraction_name?.toLowerCase().includes(term) ||
      fee.city?.toLowerCase().includes(term) ||
      fee.season_name?.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrance Fees</h1>
          <p className="text-gray-600 mt-1">Manage entrance fees for sightseeing attractions</p>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by attraction, city, or season..."
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <Button icon={PlusIcon} onClick={handleAdd}>
              Add Entrance Fee
            </Button>
          </div>
        </Card>

        {/* Main Table */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Entrance Fees</h2>
              <p className="text-sm text-gray-600">
                {filteredFees.length} entrance {filteredFees.length === 1 ? 'fee' : 'fees'} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">
                {searchTerm || cityFilter
                  ? 'No entrance fees match your filters.'
                  : 'No entrance fees found.'}
              </p>
              {!searchTerm && !cityFilter && (
                <Button icon={PlusIcon} onClick={handleAdd}>
                  Add First Entrance Fee
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Attraction</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">City</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Season</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Start Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">End Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Currency</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Adult Rate</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Child Rate</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Notes</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{fee.attraction_name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{fee.city}</td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">{fee.season_name}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {fee.start_date ? new Date(fee.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {fee.end_date ? new Date(fee.end_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {fee.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {formatCurrency(fee.adult_rate, fee.currency)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {formatCurrency(fee.child_rate, fee.currency)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {fee.notes || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(fee)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(fee)}
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
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingFee ? 'Edit Entrance Fee' : 'Add New Entrance Fee'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Attraction Name *"
              value={formData.attraction_name}
              onChange={(e) => handleFormChange('attraction_name', e.target.value)}
              error={formErrors.attraction_name}
              placeholder="e.g., Blue Mosque, Hagia Sophia..."
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CitySelect
                label="City"
                value={formData.city}
                onChange={(value) => handleFormChange('city', value)}
                error={formErrors.city}
                required
                placeholder="Select city..."
              />

              <Input
                label="Season Name *"
                value={formData.season_name}
                onChange={(e) => handleFormChange('season_name', e.target.value)}
                error={formErrors.season_name}
                placeholder="e.g., Summer 2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleFormChange('start_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.start_date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleFormChange('end_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.end_date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleFormChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="TRY">TRY</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Adult Rate (per person) *"
                type="number"
                value={formData.adult_rate}
                onChange={(e) => handleFormChange('adult_rate', e.target.value)}
                error={formErrors.adult_rate}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />

              <Input
                label="Child Rate (per person) *"
                type="number"
                value={formData.child_rate}
                onChange={(e) => handleFormChange('child_rate', e.target.value)}
                error={formErrors.child_rate}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional information..."
              />
            </div>

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
                {submitting ? 'Saving...' : editingFee ? 'Update Entrance Fee' : 'Add Entrance Fee'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default EntranceFeesList;
