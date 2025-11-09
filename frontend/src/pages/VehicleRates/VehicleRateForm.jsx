import { useState, useEffect } from 'react';
import vehicleRatesService from '../../services/vehicleRatesService';
import { CitySelect } from '@components/common';

const VehicleRateForm = ({ rate, vehicleTypes, suppliers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rate) {
      setFormData({
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
    }
  }, [rate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill supplier_name when supplier changes
    if (name === 'supplier_id') {
      const supplier = suppliers.find(s => s.id === parseInt(value));
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          supplier_name: supplier.name
        }));
      }
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCityChange = (value) => {
    setFormData(prev => ({
      ...prev,
      city: value
    }));

    // Clear error for city field
    if (errors.city) {
      setErrors(prev => ({
        ...prev,
        city: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.supplier_id) newErrors.supplier_id = 'Supplier is required';
    if (!formData.season_name.trim()) newErrors.season_name = 'Season name is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (!formData.vehicle_type_id) newErrors.vehicle_type_id = 'Vehicle type is required';

    // Date validation
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // At least one price should be filled
    const hasPricing =
      formData.full_day_price ||
      formData.half_day_price ||
      formData.airport_to_hotel ||
      formData.hotel_to_airport ||
      formData.round_trip;

    if (!hasPricing) {
      newErrors.pricing = 'At least one price must be specified';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      // Convert empty strings to null for numeric fields
      const dataToSave = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        vehicle_type_id: parseInt(formData.vehicle_type_id),
        full_day_price: formData.full_day_price ? parseFloat(formData.full_day_price) : null,
        half_day_price: formData.half_day_price ? parseFloat(formData.half_day_price) : null,
        airport_to_hotel: formData.airport_to_hotel ? parseFloat(formData.airport_to_hotel) : null,
        hotel_to_airport: formData.hotel_to_airport ? parseFloat(formData.hotel_to_airport) : null,
        round_trip: formData.round_trip ? parseFloat(formData.round_trip) : null
      };

      if (rate?.id) {
        await vehicleRatesService.update(rate.id, dataToSave);
      } else {
        await vehicleRatesService.create(dataToSave);
      }

      onSave();
    } catch (error) {
      console.error('Error saving vehicle rate:', error);
      if (error.response?.data?.error?.code === 'CONFLICT') {
        setErrors({
          general: 'A rate already exists for this city, supplier, season, and vehicle type combination'
        });
      } else {
        setErrors({
          general: error.response?.data?.error?.message || 'Failed to save vehicle rate'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {rate ? 'Edit Vehicle Rate' : 'Add New Vehicle Rate'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* General Error */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Pricing Error */}
          {errors.pricing && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              {errors.pricing}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <CitySelect
                label="City"
                value={formData.city}
                onChange={handleCityChange}
                error={errors.city}
                required
                placeholder="Select city..."
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplier_id && (
                <p className="mt-1 text-sm text-red-500">{errors.supplier_id}</p>
              )}
            </div>

            {/* Season Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="season_name"
                value={formData.season_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.season_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Winter 2025-26"
              />
              {errors.season_name && (
                <p className="mt-1 text-sm text-red-500">{errors.season_name}</p>
              )}
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_type_id"
                value={formData.vehicle_type_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicle_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.max_capacity} pax)
                  </option>
                ))}
              </select>
              {errors.vehicle_type_id && (
                <p className="mt-1 text-sm text-red-500">{errors.vehicle_type_id}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="TRY">TRY</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Full Day Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Day Price
                </label>
                <input
                  type="number"
                  name="full_day_price"
                  value={formData.full_day_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Half Day Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half Day Price
                </label>
                <input
                  type="number"
                  name="half_day_price"
                  value={formData.half_day_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Airport to Hotel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airport → Hotel
                </label>
                <input
                  type="number"
                  name="airport_to_hotel"
                  value={formData.airport_to_hotel}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Hotel to Airport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel → Airport
                </label>
                <input
                  type="number"
                  name="hotel_to_airport"
                  value={formData.hotel_to_airport}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Round Trip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Round Trip
                </label>
                <input
                  type="number"
                  name="round_trip"
                  value={formData.round_trip}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : (rate ? 'Update Rate' : 'Create Rate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRateForm;
