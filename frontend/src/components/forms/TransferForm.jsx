import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const TransferForm = ({
  initialData = null,
  availableVehicles = [],
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    transfer_type: 'airport_pickup', // airport_pickup, airport_dropoff, intercity, local
    transfer_date: '',
    pickup_time: '',
    from_location: '',
    to_location: '',
    pax_count: 1,
    vehicle_type: '', // sedan, van, minibus, bus
    operation_type: 'own', // 'own' or 'outsourced'

    // Own vehicle fields
    vehicle_id: '',
    vehicle_name: '',
    driver_name: '',

    // Pricing
    cost_price: 0,
    sell_price: 0,
    margin: 0,

    // Optional fields - Flight Details
    flight_number: '',
    flight_time: '',
    terminal: '',
    payment_status: 'pending',
    paid_amount: 0,
    payment_due_date: '',
    confirmation_number: '',
    voucher_issued: false,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-select vehicle details when vehicle_id changes
      if (field === 'vehicle_id' && value) {
        const selectedVehicle = availableVehicles.find((v) => v.id === parseInt(value));
        if (selectedVehicle) {
          updated.vehicle_name = `${selectedVehicle.type} - ${selectedVehicle.vehicle_number}`;
          updated.vehicle_type = selectedVehicle.type;
          updated.driver_name = selectedVehicle.driver_name || '';
          updated.cost_price = parseFloat(selectedVehicle.daily_rate) || 0;
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
    { value: 'airport_pickup', label: 'Airport Pickup' },
    { value: 'airport_dropoff', label: 'Airport Drop-off' },
    { value: 'intercity', label: 'Intercity Transfer' },
    { value: 'local', label: 'Local Transfer' },
  ];

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan (1-3 pax)' },
    { value: 'van', label: 'Van (4-6 pax)' },
    { value: 'minibus', label: 'Minibus (7-14 pax)' },
    { value: 'bus', label: 'Bus (15+ pax)' },
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

        {/* PAX and Vehicle Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vehicle_type}
              onChange={(e) => handleChange('vehicle_type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.vehicle_type ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select vehicle type...</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.vehicle_type && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicle_type}</p>
            )}
          </div>
        </div>

        {/* Flight Details (for airport transfers) */}
        {(formData.transfer_type === 'airport_pickup' || formData.transfer_type === 'airport_dropoff') && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
            <h5 className="text-sm font-medium text-blue-900">Flight Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  type="text"
                  label="Flight Number"
                  value={formData.flight_number}
                  onChange={(e) => handleChange('flight_number', e.target.value)}
                  placeholder="e.g., TK1234"
                />
              </div>
              <div>
                <Input
                  type="time"
                  label="Flight Time"
                  value={formData.flight_time}
                  onChange={(e) => handleChange('flight_time', e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Terminal"
                  value={formData.terminal}
                  onChange={(e) => handleChange('terminal', e.target.value)}
                  placeholder="e.g., Terminal 1"
                />
              </div>
            </div>
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
                value="own"
                checked={formData.operation_type === 'own'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Own Vehicle</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="outsourced"
                checked={formData.operation_type === 'outsourced'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Outsourced</span>
            </label>
          </div>
        </div>

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
                  {availableVehicles
                    .filter((v) => v.type.toLowerCase() === formData.vehicle_type.toLowerCase() || !formData.vehicle_type)
                    .map((vehicle) => (
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
            />
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

TransferForm.propTypes = {
  initialData: PropTypes.object,
  availableVehicles: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TransferForm;
