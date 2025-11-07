import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const TourForm = ({
  initialData = null,
  availableSuppliers = [],
  availableGuides = [],
  availableVehicles = [],
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_date: '',
    pax_count: 1,
    operation_type: 'supplier', // 'supplier' or 'self_operated'

    // Supplier operation fields
    tour_supplier_id: '',
    supplier_name: '',
    supplier_cost: 0,

    // Self-operated fields
    guide_id: '',
    guide_name: '',
    guide_cost: 0,
    vehicle_id: '',
    vehicle_name: '',
    vehicle_cost: 0,
    entrance_fees: 0,
    other_costs: 0,

    // Common fields
    total_cost: 0,
    sell_price: 0,
    margin: 0,
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

      // Auto-select supplier name when supplier_id changes
      if (field === 'tour_supplier_id' && value) {
        const selectedSupplier = availableSuppliers.find((s) => s.id === parseInt(value));
        if (selectedSupplier) {
          updated.supplier_name = selectedSupplier.name;
        }
      }

      // Auto-select guide name when guide_id changes
      if (field === 'guide_id' && value) {
        const selectedGuide = availableGuides.find((g) => g.id === parseInt(value));
        if (selectedGuide) {
          updated.guide_name = selectedGuide.name;
          updated.guide_cost = parseFloat(selectedGuide.daily_rate) || 0;
        }
      }

      // Auto-select vehicle name when vehicle_id changes
      if (field === 'vehicle_id' && value) {
        const selectedVehicle = availableVehicles.find((v) => v.id === parseInt(value));
        if (selectedVehicle) {
          updated.vehicle_name = `${selectedVehicle.type} - ${selectedVehicle.vehicle_number}`;
          updated.vehicle_cost = parseFloat(selectedVehicle.daily_rate) || 0;
        }
      }

      // Auto-calculate total cost based on operation type
      if (
        field === 'operation_type' ||
        field === 'supplier_cost' ||
        field === 'guide_cost' ||
        field === 'vehicle_cost' ||
        field === 'entrance_fees' ||
        field === 'other_costs'
      ) {
        if (updated.operation_type === 'supplier') {
          updated.total_cost = parseFloat(updated.supplier_cost) || 0;
        } else {
          const guideCost = parseFloat(updated.guide_cost) || 0;
          const vehicleCost = parseFloat(updated.vehicle_cost) || 0;
          const entranceFees = parseFloat(updated.entrance_fees) || 0;
          const otherCosts = parseFloat(updated.other_costs) || 0;
          updated.total_cost = guideCost + vehicleCost + entranceFees + otherCosts;
        }
      }

      // Auto-calculate margin
      if (field === 'sell_price' || field === 'total_cost') {
        const sellPrice = parseFloat(updated.sell_price) || 0;
        const totalCost = parseFloat(updated.total_cost) || 0;
        updated.margin = sellPrice - totalCost;
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

    if (!formData.tour_name.trim()) {
      newErrors.tour_name = 'Tour name is required';
    }
    if (!formData.tour_date) {
      newErrors.tour_date = 'Tour date is required';
    }
    if (formData.pax_count < 1) {
      newErrors.pax_count = 'PAX count must be at least 1';
    }

    // Validate based on operation type
    if (formData.operation_type === 'supplier') {
      if (!formData.tour_supplier_id) {
        newErrors.tour_supplier_id = 'Please select a tour supplier';
      }
    } else {
      if (!formData.guide_id && !formData.vehicle_id) {
        newErrors.guide_id = 'Please select at least a guide or vehicle';
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

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <h4 className="font-medium text-slate-900 text-lg">
        {isEditing ? 'Edit Tour Service' : 'Add New Tour Service'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="text"
              label="Tour Name"
              value={formData.tour_name}
              onChange={(e) => handleChange('tour_name', e.target.value)}
              placeholder="e.g., Cappadocia Hot Air Balloon"
              error={errors.tour_name}
              required
            />
          </div>
          <div>
            <Input
              type="date"
              label="Tour Date"
              value={formData.tour_date}
              onChange={(e) => handleChange('tour_date', e.target.value)}
              error={errors.tour_date}
              required
            />
          </div>
          <div>
            <Input
              type="number"
              label="PAX Count"
              value={formData.pax_count}
              onChange={(e) => handleChange('pax_count', e.target.value)}
              min="1"
              required
            />
          </div>
        </div>

        {/* Operation Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Operation Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="supplier"
                checked={formData.operation_type === 'supplier'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Through Supplier</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="self_operated"
                checked={formData.operation_type === 'self_operated'}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Self-Operated</span>
            </label>
          </div>
        </div>

        {/* Supplier Operation Fields */}
        {formData.operation_type === 'supplier' && (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <h5 className="text-sm font-medium text-slate-700">Supplier Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tour Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tour_supplier_id}
                  onChange={(e) => handleChange('tour_supplier_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.tour_supplier_id ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a supplier...</option>
                  {availableSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.tour_supplier_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.tour_supplier_id}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  label="Supplier Cost"
                  value={formData.supplier_cost}
                  onChange={(e) => handleChange('supplier_cost', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {/* Self-Operated Fields */}
        {formData.operation_type === 'self_operated' && (
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
            <h5 className="text-sm font-medium text-slate-700">Self-Operation Details</h5>

            {/* Guide & Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Guide
                </label>
                <select
                  value={formData.guide_id}
                  onChange={(e) => handleChange('guide_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.guide_id ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a guide...</option>
                  {availableGuides.map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.name} - {guide.languages}
                    </option>
                  ))}
                </select>
                {errors.guide_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.guide_id}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  label="Guide Cost"
                  value={formData.guide_cost}
                  onChange={(e) => handleChange('guide_cost', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => handleChange('vehicle_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vehicle...</option>
                  {availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.type} - {vehicle.vehicle_number} (Capacity: {vehicle.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  type="number"
                  label="Vehicle Cost"
                  value={formData.vehicle_cost}
                  onChange={(e) => handleChange('vehicle_cost', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Additional Costs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  label="Entrance Fees"
                  value={formData.entrance_fees}
                  onChange={(e) => handleChange('entrance_fees', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Input
                  type="number"
                  label="Other Costs"
                  value={formData.other_costs}
                  onChange={(e) => handleChange('other_costs', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="number"
              label="Total Cost"
              value={formData.total_cost}
              readOnly
              disabled
              className="bg-slate-100"
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
                placeholder="Tour confirmation #"
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
              placeholder="Additional notes or special requests..."
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
            {isEditing ? 'Update Tour' : 'Add Tour'}
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

TourForm.propTypes = {
  initialData: PropTypes.object,
  availableSuppliers: PropTypes.array.isRequired,
  availableGuides: PropTypes.array.isRequired,
  availableVehicles: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TourForm;
