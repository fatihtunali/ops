import { useState, useEffect } from 'react';
import { useToast } from '@context/ToastContext';
import vehicleRatesService from '../../services/vehicleRatesService';
import vehicleTypesService from '../../services/vehicleTypesService';
import tourSuppliersService from '../../services/tourSuppliersService';
import VehicleRateForm from './VehicleRateForm';

const VehicleRatesList = () => {
  const toast = useToast();
  const [rates, setRates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterCity, setFilterCity] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadRates();
  }, [filterCity, filterSupplier, filterSeason, filterVehicleType, currentPage]);

  const loadInitialData = async () => {
    try {
      const [vehicleTypesRes, suppliersRes, citiesRes] = await Promise.all([
        vehicleTypesService.getAll(),
        tourSuppliersService.getAll(),
        vehicleRatesService.getCities()
      ]);

      setVehicleTypes(vehicleTypesRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setCities(citiesRes.data || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    }
  };

  const loadRates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (filterCity) params.city = filterCity;
      if (filterSupplier) params.supplier_id = filterSupplier;
      if (filterSeason) params.season_name = filterSeason;
      if (filterVehicleType) params.vehicle_type_id = filterVehicleType;

      const response = await vehicleRatesService.getAll(params);
      setRates(response.data || []);

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading rates:', err);
      setError('Failed to load vehicle rates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRate(null);
    setShowModal(true);
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) {
      return;
    }

    setDeleting(true);
    try {
      await vehicleRatesService.delete(id);
      toast.success('Vehicle rate deleted successfully');
      loadRates();
    } catch (err) {
      console.error('Error deleting rate:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete rate');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    setEditingRate(null);
    loadRates();
  };

  const resetFilters = () => {
    setFilterCity('');
    setFilterSupplier('');
    setFilterSeason('');
    setFilterVehicleType('');
    setCurrentPage(1);
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && rates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading vehicle rates...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Rates Management</h1>
        <p className="text-gray-600 mt-1">Manage seasonal vehicle pricing by city and supplier</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Season
            </label>
            <input
              type="text"
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              placeholder="e.g., Winter 2025-26"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <select
              value={filterVehicleType}
              onChange={(e) => setFilterVehicleType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {vehicleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.max_capacity} pax)
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Reset
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Rate
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAX
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Day
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Half Day
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apt→Hotel
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel→Apt
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Round Trip
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    No vehicle rates found. Click "Add Rate" to create one.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rate.city}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rate.supplier_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{rate.season_name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(rate.start_date)} - {formatDate(rate.end_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rate.vehicle_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {rate.max_capacity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(rate.full_day_price, rate.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(rate.half_day_price, rate.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(rate.airport_to_hotel, rate.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(rate.hotel_to_airport, rate.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(rate.round_trip, rate.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <VehicleRateForm
          rate={editingRate}
          vehicleTypes={vehicleTypes}
          suppliers={suppliers}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false);
            setEditingRate(null);
          }}
        />
      )}
    </div>
  );
};

export default VehicleRatesList;
