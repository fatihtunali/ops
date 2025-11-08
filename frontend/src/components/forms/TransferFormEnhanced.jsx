import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import vehicleRatesService from '@services/vehicleRatesService';
import vehicleTypesService from '@services/vehicleTypesService';
import tourSuppliersService from '@services/tourSuppliersService';

const TransferFormEnhanced = ({
  initialData = null,
  availableVehicles = [],
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    transfer_type: 'airport_pickup',
    transfer_date: '',
    pickup_time: '',
    from_location: '',
    to_location: '',
    pax_count: 1,
    vehicle_type: '',
    operation_type: 'outsourced', // Default to outsourced for rate integration

    // City & Supplier (for rate lookup)
    city: '',
    supplier_id: '',

    // Own vehicle fields
    vehicle_id: '',
    vehicle_name: '',
    driver_name: '',

    // Pricing
    cost_price: 0,
    sell_price: 0,
    margin: 0,

    // Optional fields
    flight_number: '',
    payment_status: 'pending',
    paid_amount: 0,
    payment_due_date: '',
    confirmation_number: '',
    voucher_issued: false,
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [availableRates, setAvailableRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);

  // Load vehicle types and suppliers on mount
  useEffect(() => {
    loadVehicleTypes();
    loadSuppliers();
  }, []);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Load vehicle rates when city, supplier, or date changes
  useEffect(() => {
    if (formData.city && formData.supplier_id && formData.transfer_date && formData.operation_type === 'outsourced') {
      loadVehicleRates();
    }
  }, [formData.city, formData.supplier_id, formData.transfer_date, formData.operation_type]);

  const loadVehicleTypes = async () => {
    try {
      const response = await vehicleTypesService.getAll();
      setVehicleTypes(response.data || []);
    } catch (error) {
      console.error('Error loading vehicle types:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await tourSuppliersService.getAll();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadVehicleRates = async () => {
    setLoadingRates(true);
    try {
      const response = await vehicleRatesService.searchForBooking({
        city: formData.city,
        supplier_id: formData.supplier_id,
        date: formData.transfer_date
      });
      setAvailableRates(response.data || []);
    } catch (error) {
      console.error('Error loading vehicle rates:', error);
      setAvailableRates([]);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-select vehicle details when vehicle_id changes (for own vehicles)
      if (field === 'vehicle_id' && value && updated.operation_type === 'own') {
        const selectedVehicle = availableVehicles.find((v) => v.id === parseInt(value));
        if (selectedVehicle) {
          updated.vehicle_name = `${selectedVehicle.type} - ${selectedVehicle.vehicle_number}`;
          updated.vehicle_type = selectedVehicle.type;
          updated.driver_name = selectedVehicle.driver_name || '';
          updated.cost_price = parseFloat(selectedVehicle.daily_rate) || 0;
        }
      }

      // Auto-populate cost price from vehicle rates (for outsourced)
      if ((field === 'vehicle_type' || field === 'transfer_type') && updated.operation_type === 'outsourced') {
        const selectedRate = availableRates.find(r => r.vehicle_type_id === parseInt(updated.vehicle_type));
        if (selectedRate) {
          // Map transfer type to rate field
          const priceField = {
            'airport_pickup': 'airport_to_hotel',
            'airport_dropoff': 'hotel_to_airport',
            'intercity': 'full_day_price',
            'local': 'half_day_price'
          }[updated.transfer_type];

          if (priceField && selectedRate[priceField]) {
            updated.cost_price = parseFloat(selectedRate[priceField]);
          }
        }
      }

      // Auto-calculate margin
      if (field === 'sell_price' || field === 'cost_price') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const costPrice = parseFloat(updated.cost_price) || 0;
        updated.margin = sellPrice - costPrice;
      }

      return updated;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.transfer_date) {
      newErrors.transfer_date = 'Transfer date is required';
    }
    if (!formData.from_location.trim()) {
      newErrors.from_location = 'From location is required';
    }
    if (!formData.to_location.trim()) {
      newErrors.to_location = 'To location is required';
    }
    if (formData.pax_count < 1) {
      newErrors.pax_count = 'PAX count must be at least 1';
    }
    if (!formData.vehicle_type) {
      newErrors.vehicle_type = 'Vehicle type is required';
    }
    if (formData.operation_type === 'outsourced') {
      if (!formData.city.trim()) {
        newErrors.city = 'City is required for outsourced transfers';
      }
      if (!formData.supplier_id) {
        newErrors.supplier_id = 'Supplier is required for outsourced transfers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave(formData);
  };

  const isEditing = !!initialData;

  const transferTypes = [
    { value: 'airport_pickup', label: 'Airport Pickup', priceField: 'airport_to_hotel' },
    { value: 'airport_dropoff', label: 'Airport Drop-off', priceField: 'hotel_to_airport' },
    { value: 'intercity', label: 'Intercity Transfer', priceField: 'full_day_price' },
    { value: 'local', label: 'Local Transfer', priceField: 'half_day_price' },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <h4 className="font-medium text-slate-900 text-lg">
        {isEditing ? 'Edit Transfer Service' : 'Add New Transfer Service'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transfer Type & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Transfer Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.transfer_type}
              onChange={(e) => handleChange('transfer_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {transferTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Input
              type="date"
              label="Transfer Date"
              value={formData.transfer_date}
              onChange={(e) => handleChange('transfer_date', e.target.value)}
              error={errors.transfer_date}
              required
            />
          </div>
          <div>
            <Input
              type="time"
              label="Pickup Time"
              value={formData.pickup_time}
              onChange={(e) => handleChange('pickup_time', e.target.value)}
            />
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              label="From Location"
              value={formData.from_location}
              onChange={(e) => handleChange('from_location', e.target.value)}
              placeholder="e.g., Istanbul Airport (IST)"
              error={errors.from_location}
              required
            />
          </div>
          <div>
            <Input
              type="text"
              label="To Location"
              value={formData.to_location}
              onChange={(e) => handleChange('to_location', e.target.value)}
              placeholder="e.g., Sultanahmet Hotel"
              error={errors.to_location}
              required
            />
          </div>
        </div>

        {/* PAX Count */}
        <div>
          <Input
            type="number"
            label="PAX Count"
            value={formData.pax_count}
            onChange={(e) => handleChange('pax_count', e.target.value)}
            min="1"
            error={errors.pax_count}
            required
          />
        </div>

        {/* Flight Number (for airport transfers) */}
        {(formData.transfer_type === 'airport_pickup' || formData.transfer_type === 'airport_dropoff') && (
          <div>
            <Input
              type="text"
              label="Flight Number (Optional)"
              value={formData.flight_number}
              onChange={(e) => handleChange('flight_number', e.target.value)}
              placeholder="e.g., TK123"
            />
          </div>
        )}

        {/* Operation Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Operation Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="outsourced"
                checked={formData.operation_type === 'outsourced'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Outsourced (Supplier)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="own"
                checked={formData.operation_type === 'own'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Own Vehicle</span>
            </label>
          </div>
        </div>

        {/* Outsourced - City & Supplier Selection */}
        {formData.operation_type === 'outsourced' && (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <h5 className="text-sm font-medium text-slate-700">Supplier & Rates</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g., Antalya, Istanbul"
                  error={errors.city}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => handleChange('supplier_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.supplier_id ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>
                )}
              </div>
            </div>

            {/* Vehicle Type Selection with Rates */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              {loadingRates ? (
                <p className="text-sm text-gray-500">Loading available rates...</p>
              ) : availableRates.length > 0 ? (
                <div className="space-y-2">
                  {availableRates.map((rate) => {
                    const priceField = transferTypes.find(t => t.value === formData.transfer_type)?.priceField;
                    const price = rate[priceField];

                    return (
                      <label
                        key={rate.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          parseInt(formData.vehicle_type) === rate.vehicle_type_id
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="vehicle_type"
                            value={rate.vehicle_type_id}
                            checked={parseInt(formData.vehicle_type) === rate.vehicle_type_id}
                            onChange={(e) => handleChange('vehicle_type', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <p className="font-medium text-slate-900">{rate.vehicle_type}</p>
                            <p className="text-sm text-slate-500">{rate.max_capacity} passengers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {formatCurrency(price, rate.currency)}
                          </p>
                          <p className="text-xs text-slate-500">Cost Price</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => handleChange('vehicle_type', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.vehicle_type ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select vehicle type...</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.max_capacity} pax)
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-amber-600 mt-1">
                    No predefined rates found. Please enter pricing manually below.
                  </p>
                </div>
              )}
              {errors.vehicle_type && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicle_type}</p>
              )}
            </div>
          </div>
        )}

        {/* Own Vehicle Selection */}
        {formData.operation_type === 'own' && (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <h5 className="text-sm font-medium text-slate-700">Vehicle Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Vehicle
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => handleChange('vehicle_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vehicle...</option>
                  {availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.type} - {vehicle.vehicle_number} (Driver: {vehicle.driver_name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  type="text"
                  label="Driver Name"
                  value={formData.driver_name}
                  onChange={(e) => handleChange('driver_name', e.target.value)}
                  placeholder="Driver name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              label="Cost Price"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              min="0"
              step="0.01"
              disabled={formData.operation_type === 'outsourced' && availableRates.length > 0 && formData.vehicle_type}
            />
            {formData.operation_type === 'outsourced' && availableRates.length > 0 && formData.vehicle_type && (
              <p className="text-xs text-green-600 mt-1">✓ Auto-populated from supplier rates</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              label="Sell Price"
              value={formData.sell_price}
              onChange={(e) => handleChange('sell_price', e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Margin Display */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-500 uppercase mb-1">Profit Margin</p>
          <p className={`text-xl font-bold ${formData.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(formData.margin)}
            {formData.sell_price > 0 && (
              <span className="text-sm ml-2 text-slate-600">
                ({((formData.margin / formData.sell_price) * 100).toFixed(1)}%)
              </span>
            )}
          </p>
        </div>

        {/* Optional Fields */}
        <div className="border-t border-blue-300 pt-4 space-y-4">
          <h5 className="text-sm font-medium text-slate-700">Payment Details (Optional)</h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => handleChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <Input
                type="number"
                label="Paid Amount"
                value={formData.paid_amount}
                onChange={(e) => handleChange('paid_amount', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Input
                type="date"
                label="Payment Due Date"
                value={formData.payment_due_date}
                onChange={(e) => handleChange('payment_due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                label="Confirmation Number"
                value={formData.confirmation_number}
                onChange={(e) => handleChange('confirmation_number', e.target.value)}
                placeholder="Transfer confirmation #"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.voucher_issued}
                  onChange={(e) => handleChange('voucher_issued', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Voucher Issued</span>
              </label>
            </div>
          </div>

          <div>
            <Input
              type="textarea"
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows="3"
              placeholder="Additional notes or special instructions..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-blue-300">
          <Button
            type="submit"
            variant="primary"
            icon={CheckIcon}
            className="flex-1"
          >
            {isEditing ? 'Update Transfer' : 'Add Transfer'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={XMarkIcon}
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

TransferFormEnhanced.propTypes = {
  initialData: PropTypes.object,
  availableVehicles: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

TransferFormEnhanced.defaultProps = {
  availableVehicles: [],
};

export default TransferFormEnhanced;
