import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal, CitySelect } from '@components/common';
import { tourSuppliersService } from '@services/tourSuppliersService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@context/ToastContext';

const TourSuppliersList = () => {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
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

  // Fetch suppliers
  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, statusFilter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.status = statusFilter;
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tour Suppliers Management</h1>
            <p className="text-gray-600 mt-1">Manage tour suppliers and service providers</p>
          </div>
          <Button icon={PlusIcon} onClick={handleAdd}>
            Add Supplier
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
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
            <Button type="submit">Search</Button>
          </form>
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
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Terms</th>
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
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {supplier.payment_terms || '-'}
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

        {/* Add/Edit Modal */}
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
      </div>
    </MainLayout>
  );
};

export default TourSuppliersList;
