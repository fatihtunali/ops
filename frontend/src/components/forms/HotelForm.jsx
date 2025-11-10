import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import { ROOM_TYPES } from '@utils/constants';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const HotelForm = ({
  initialData = null,
  availableHotels = [],
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    hotel_id: '',
    hotel_name: '',
    check_in: '',
    check_out: '',
    nights: 0,
    room_type: '',
    number_of_rooms: 1,
    cost_per_night: 0,
    total_cost: 0,
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

      // Auto-select hotel name when hotel_id changes
      if (field === 'hotel_id' && value) {
        const selectedHotel = availableHotels.find((h) => h.id === parseInt(value));
        if (selectedHotel) {
          updated.hotel_name = selectedHotel.name;
        }
      }

      // Auto-calculate nights when dates change
      if (field === 'check_in' || field === 'check_out') {
        if (updated.check_in && updated.check_out) {
          const checkIn = new Date(updated.check_in);
          const checkOut = new Date(updated.check_out);
          const diffTime = checkOut - checkIn;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updated.nights = diffDays > 0 ? diffDays : 0;
        }
      }

      // Auto-calculate total cost when relevant fields change
      if (
        field === 'cost_per_night' ||
        field === 'nights' ||
        field === 'number_of_rooms'
      ) {
        const costPerNight = parseFloat(updated.cost_per_night) || 0;
        const nights = parseInt(updated.nights) || 0;
        const rooms = parseInt(updated.number_of_rooms) || 1;
        updated.total_cost = costPerNight * nights * rooms;
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

    if (!formData.hotel_id) {
      newErrors.hotel_id = 'Please select a hotel';
    }
    if (!formData.room_type) {
      newErrors.room_type = 'Please select a room type';
    }
    if (!formData.check_in) {
      newErrors.check_in = 'Check-in date is required';
    }
    if (!formData.check_out) {
      newErrors.check_out = 'Check-out date is required';
    }
    if (formData.check_in && formData.check_out && formData.check_out <= formData.check_in) {
      newErrors.check_out = 'Check-out must be after check-in';
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
        {isEditing ? 'Edit Hotel Service' : 'Add New Hotel Service'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hotel Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hotel <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.hotel_id}
              onChange={(e) => handleChange('hotel_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.hotel_id ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select a hotel...</option>
              {availableHotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} - {hotel.location}
                </option>
              ))}
            </select>
            {errors.hotel_id && (
              <p className="text-red-500 text-sm mt-1">{errors.hotel_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.room_type}
              onChange={(e) => handleChange('room_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Room Type</option>
              {ROOM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.room_type && (
              <p className="text-red-500 text-sm mt-1">{errors.room_type}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="date"
              label="Check-in Date"
              value={formData.check_in}
              onChange={(e) => handleChange('check_in', e.target.value)}
              error={errors.check_in}
              required
            />
          </div>
          <div>
            <Input
              type="date"
              label="Check-out Date"
              value={formData.check_out}
              onChange={(e) => handleChange('check_out', e.target.value)}
              error={errors.check_out}
              required
            />
          </div>
          <div>
            <Input
              type="number"
              label="Nights"
              value={formData.nights}
              readOnly
              disabled
              className="bg-slate-100"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              type="number"
              label="Number of Rooms"
              value={formData.number_of_rooms}
              onChange={(e) => handleChange('number_of_rooms', e.target.value)}
              min="1"
            />
          </div>
          <div>
            <Input
              type="number"
              label="Cost per Night"
              value={formData.cost_per_night}
              onChange={(e) => handleChange('cost_per_night', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
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
        </div>

        {/* Optional Fields (Collapsible) */}
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
                placeholder="Hotel confirmation #"
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
            {isEditing ? 'Update Hotel' : 'Add Hotel'}
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

HotelForm.propTypes = {
  initialData: PropTypes.object,
  availableHotels: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default HotelForm;
