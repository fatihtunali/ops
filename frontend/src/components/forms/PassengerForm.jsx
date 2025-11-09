import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@components/common';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const PassengerForm = ({
  initialData = null,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    passenger_type: 'adult', // adult, child, infant (frontend-only, not saved to DB)
    date_of_birth: '',
    passport_number: '',
    passport_expiry: '', // frontend-only, not saved to DB
    nationality: '',
    special_requests: '',
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Passenger name is required';
    }

    // Validate passport expiry if passport number is provided
    if (formData.passport_number && formData.passport_expiry) {
      const expiryDate = new Date(formData.passport_expiry);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.passport_expiry = 'Passport has expired';
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

  const passengerTypes = [
    { value: 'adult', label: 'Adult (12+ years)' },
    { value: 'child', label: 'Child (2-11 years)' },
    { value: 'infant', label: 'Infant (0-1 years)' },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <h4 className="font-medium text-slate-900 text-lg">
        {isEditing ? 'Edit Passenger' : 'Add New Passenger'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Passenger Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              label="Passenger Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Full name as on passport"
              error={errors.name}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Passenger Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.passenger_type}
              onChange={(e) => handleChange('passenger_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {passengerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date of Birth & Nationality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="date"
              label="Date of Birth"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
            />
          </div>
          <div>
            <Input
              type="text"
              label="Nationality"
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="e.g., Turkish, American"
            />
          </div>
        </div>

        {/* Passport Details */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
          <h5 className="text-sm font-medium text-slate-700">Passport Information (Optional)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                label="Passport Number"
                value={formData.passport_number}
                onChange={(e) => handleChange('passport_number', e.target.value)}
                placeholder="e.g., A12345678"
              />
            </div>
            <div>
              <Input
                type="date"
                label="Passport Expiry Date"
                value={formData.passport_expiry}
                onChange={(e) => handleChange('passport_expiry', e.target.value)}
                error={errors.passport_expiry}
              />
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <Input
            type="textarea"
            label="Special Requests"
            value={formData.special_requests}
            onChange={(e) => handleChange('special_requests', e.target.value)}
            rows="3"
            placeholder="Special requirements, dietary restrictions, etc."
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-blue-300">
          <Button
            type="submit"
            variant="primary"
            icon={CheckIcon}
            className="flex-1"
          >
            {isEditing ? 'Update Passenger' : 'Add Passenger'}
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

PassengerForm.propTypes = {
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PassengerForm;
