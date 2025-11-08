import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { vehiclesService } from '@services/vehiclesService';
import vehicleTypesService from '@services/vehicleTypesService';
import { formatCurrency } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
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
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    type: '',
    capacity: '',
    daily_rate: '',
    driver_name: '',
    driver_phone: '',
    status: 'available',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch vehicle types on mount
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, statusFilter]);

  const fetchVehicleTypes = async () => {
    try {
      const response = await vehicleTypesService.getAll();
      console.log('Vehicle types full response:', response);
      // Response is already unwrapped to the array by the API wrapper
      const types = Array.isArray(response) ? response : (response?.data || []);
      console.log('Extracted vehicle types:', types);
      setVehicleTypes(types);
    } catch (err) {
      console.error('Failed to fetch vehicle types:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await vehiclesService.getAll(params);
      const data = response?.data || response;

      if (data && Array.isArray(data.vehicles || data)) {
        setVehicles(data.vehicles || data);
        setTotalCount(data.total || data.length);
        setTotalPages(Math.ceil((data.total || data.length) / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVehicles();
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_number: '',
      type: '',
      capacity: '',
      daily_rate: '',
      driver_name: '',
      driver_phone: '',
      status: 'available',
      notes: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number || '',
      type: vehicle.type || '',
      capacity: vehicle.capacity || '',
      daily_rate: vehicle.daily_rate || '',
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || '',
      status: vehicle.status || 'available',
      notes: vehicle.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to delete vehicle "${vehicle.vehicle_number}"?`)) {
      return;
    }

    try {
      await vehiclesService.delete(vehicle.id);
      fetchVehicles();
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.vehicle_number?.trim()) {
      errors.vehicle_number = 'Vehicle number is required';
    }

    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 1)) {
      errors.capacity = 'Capacity must be a positive number';
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
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
      };

      if (editingVehicle) {
        await vehiclesService.update(editingVehicle.id, submitData);
      } else {
        await vehiclesService.create(submitData);
      }

      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If vehicle type changes, auto-populate capacity
    if (field === 'type') {
      const selectedType = vehicleTypes.find(vt => vt.name === value);
      if (selectedType) {
        setFormData((prev) => ({ ...prev, type: value, capacity: selectedType.max_capacity }));
      }
    }

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
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
      case 'in_use':
        return 'warning';
      case 'maintenance':
        return 'danger';
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
            <h1 className="text-2xl font-bold text-gray-900">Vehicles Management</h1>
            <p className="text-gray-600 mt-1">Manage vehicle fleet and availability</p>
          </div>
          <Button icon={PlusIcon} onClick={handleAdd}>
            Add Vehicle
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by vehicle number, type, driver name..."
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
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
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

        {/* Vehicles List */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first vehicle.</p>
              <Button icon={PlusIcon} onClick={handleAdd}>
                Add Vehicle
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Capacity</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Driver</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Daily Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{vehicle.vehicle_number}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">{vehicle.type || '-'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {vehicle.capacity ? `${vehicle.capacity} pax` : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {vehicle.driver_name && <div className="text-gray-900">{vehicle.driver_name}</div>}
                            {vehicle.driver_phone && <div className="text-gray-600">{vehicle.driver_phone}</div>}
                            {!vehicle.driver_name && !vehicle.driver_phone && <span className="text-gray-400">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {vehicle.daily_rate ? formatCurrency(vehicle.daily_rate) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(vehicle.status)}>
                            {vehicle.status || 'available'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle)}
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} vehicles
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
          title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Number */}
            <Input
              label="Vehicle Number *"
              value={formData.vehicle_number}
              onChange={(e) => handleFormChange('vehicle_number', e.target.value)}
              error={formErrors.vehicle_number}
              placeholder="e.g., 34-ABC-123"
              required
            />

            {/* Type and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type {vehicleTypes.length === 0 && <span className="text-red-500 text-xs">(Loading...)</span>}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes && vehicleTypes.length > 0 ? (
                    vehicleTypes.map((vType) => (
                      <option key={vType.id} value={vType.name}>
                        {vType.name} ({vType.max_capacity} pax)
                      </option>
                    ))
                  ) : null}
                </select>
                {vehicleTypes.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">Loading vehicle types from database...</p>
                )}
              </div>
              <Input
                label="Capacity (Passengers)"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleFormChange('capacity', e.target.value)}
                error={formErrors.capacity}
                disabled={true}
                placeholder="Auto-filled from vehicle type"
              />
            </div>

            {/* Daily Rate */}
            <Input
              label="Daily Rate"
              type="number"
              step="0.01"
              value={formData.daily_rate}
              onChange={(e) => handleFormChange('daily_rate', e.target.value)}
              error={formErrors.daily_rate}
            />

            {/* Driver Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Driver Information</h3>
              <div className="space-y-3">
                <Input
                  label="Driver Name"
                  value={formData.driver_name}
                  onChange={(e) => handleFormChange('driver_name', e.target.value)}
                />
                <Input
                  label="Driver Phone"
                  value={formData.driver_phone}
                  onChange={(e) => handleFormChange('driver_phone', e.target.value)}
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
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
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
                {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default VehiclesList;
