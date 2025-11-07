import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { hotelsService } from '@services/hotelsService';
import { formatCurrency } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
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
    standard_cost_per_night: '',
    notes: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
        setHotels(data.hotels || data);
        setTotalCount(data.total || data.length);
        setTotalPages(Math.ceil((data.total || data.length) / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
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
      standard_cost_per_night: '',
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
      standard_cost_per_night: hotel.standard_cost_per_night || '',
      notes: hotel.notes || '',
      status: hotel.status || 'active',
    });
    setFormErrors({});
    setShowModal(true);
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

    if (formData.standard_cost_per_night && isNaN(formData.standard_cost_per_night)) {
      errors.standard_cost_per_night = 'Cost must be a number';
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
        standard_cost_per_night: formData.standard_cost_per_night ? parseFloat(formData.standard_cost_per_night) : null,
      };

      if (editingHotel) {
        await hotelsService.update(editingHotel.id, submitData);
      } else {
        await hotelsService.create(submitData);
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
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cost/Night</th>
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
                          <div className="text-sm">
                            {hotel.contact_person && <div className="text-gray-900">{hotel.contact_person}</div>}
                            {hotel.contact_phone && <div className="text-gray-600">{hotel.contact_phone}</div>}
                            {hotel.contact_email && <div className="text-gray-600">{hotel.contact_email}</div>}
                            {!hotel.contact_person && !hotel.contact_phone && !hotel.contact_email && <span className="text-gray-400">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {hotel.standard_cost_per_night ? formatCurrency(hotel.standard_cost_per_night) : '-'}
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

            {/* Pricing */}
            <div className="border-t pt-4">
              <Input
                label="Standard Cost Per Night"
                type="number"
                step="0.01"
                value={formData.standard_cost_per_night}
                onChange={(e) => handleFormChange('standard_cost_per_night', e.target.value)}
                error={formErrors.standard_cost_per_night}
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
      </div>
    </MainLayout>
  );
};

export default HotelsList;
