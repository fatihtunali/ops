import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const FlightForm = ({
  initialData = null,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    from_airport: '',
    to_airport: '',
    pax_count: 1,
    booking_class: 'economy', // economy, business, first
    cost_price: 0,
    sell_price: 0,
    margin: 0,
    pnr: '',
    ticket_numbers: '',
    payment_status: 'pending',
    paid_amount: 0,
    payment_due_date: '',
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

    if (!formData.airline.trim()) {
      newErrors.airline = 'Airline is required';
    }
    if (!formData.flight_number.trim()) {
      newErrors.flight_number = 'Flight number is required';
    }
    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required';
    }
    if (!formData.from_airport.trim()) {
      newErrors.from_airport = 'Departure airport is required';
    }
    if (!formData.to_airport.trim()) {
      newErrors.to_airport = 'Arrival airport is required';
    }
    if (formData.pax_count < 1) {
      newErrors.pax_count = 'PAX count must be at least 1';
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

  const bookingClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <h4 className="font-medium text-slate-900 text-lg">
        {isEditing ? 'Edit Flight Service' : 'Add New Flight Service'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Airline & Flight Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="text"
              label="Airline"
              value={formData.airline}
              onChange={(e) => handleChange('airline', e.target.value)}
              placeholder="e.g., Turkish Airlines"
              error={errors.airline}
              required
            />
          </div>
          <div>
            <Input
              type="text"
              label="Flight Number"
              value={formData.flight_number}
              onChange={(e) => handleChange('flight_number', e.target.value)}
              placeholder="e.g., TK123"
              error={errors.flight_number}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Booking Class
            </label>
            <select
              value={formData.booking_class}
              onChange={(e) => handleChange('booking_class', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {bookingClasses.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Departure Details */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
          <h5 className="text-sm font-medium text-slate-700">Departure Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                label="From Airport"
                value={formData.from_airport}
                onChange={(e) => handleChange('from_airport', e.target.value)}
                placeholder="e.g., IST - Istanbul"
                error={errors.from_airport}
                required
              />
            </div>
            <div>
              <Input
                type="date"
                label="Departure Date"
                value={formData.departure_date}
                onChange={(e) => handleChange('departure_date', e.target.value)}
                error={errors.departure_date}
                required
              />
            </div>
            <div>
              <Input
                type="time"
                label="Departure Time"
                value={formData.departure_time}
                onChange={(e) => handleChange('departure_time', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Arrival Details */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
          <h5 className="text-sm font-medium text-slate-700">Arrival Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                label="To Airport"
                value={formData.to_airport}
                onChange={(e) => handleChange('to_airport', e.target.value)}
                placeholder="e.g., JFK - New York"
                error={errors.to_airport}
                required
              />
            </div>
            <div>
              <Input
                type="date"
                label="Arrival Date"
                value={formData.arrival_date}
                onChange={(e) => handleChange('arrival_date', e.target.value)}
              />
            </div>
            <div>
              <Input
                type="time"
                label="Arrival Time"
                value={formData.arrival_time}
                onChange={(e) => handleChange('arrival_time', e.target.value)}
              />
            </div>
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

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              label="Cost Price (per person)"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Input
              type="number"
              label="Sell Price (per person)"
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
          <p className="text-xs text-slate-500 uppercase mb-1">Profit Margin (per person)</p>
          <p className={`text-xl font-bold ${formData.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(formData.margin)}
            {formData.sell_price > 0 && (
              <span className="text-sm ml-2 text-slate-600">
                ({((formData.margin / formData.sell_price) * 100).toFixed(1)}%)
              </span>
            )}
          </p>
          {formData.pax_count > 1 && (
            <p className="text-sm text-slate-600 mt-2">
              Total Margin: {formatCurrency(formData.margin * formData.pax_count)} ({formData.pax_count} passengers)
            </p>
          )}
        </div>

        {/* Booking Details */}
        <div className="border-t border-blue-300 pt-4 space-y-4">
          <h5 className="text-sm font-medium text-slate-700">Booking Details</h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                label="PNR / Booking Reference"
                value={formData.pnr}
                onChange={(e) => handleChange('pnr', e.target.value)}
                placeholder="e.g., ABC123"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Ticket Numbers"
                value={formData.ticket_numbers}
                onChange={(e) => handleChange('ticket_numbers', e.target.value)}
                placeholder="e.g., 123-4567890123"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
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

          <div className="flex items-center">
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
            {isEditing ? 'Update Flight' : 'Add Flight'}
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

FlightForm.propTypes = {
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default FlightForm;
