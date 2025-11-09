import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import citiesService from '@services/citiesService';

/**
 * CitySelect Component
 * Searchable dropdown for selecting Turkish cities
 * Supports both single and multiple selection
 */
const CitySelect = ({
  label,
  value, // For single select: string, For multiple: array of strings
  onChange,
  error,
  required = false,
  multiple = false,
  placeholder = 'Select city...',
  className = '',
}) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await citiesService.getAll();
      const cityList = Array.isArray(response) ? response : (response?.data || []);
      setCities(cityList);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (cityName) => {
    if (multiple) {
      const currentValues = value || [];
      if (currentValues.includes(cityName)) {
        onChange(currentValues.filter(c => c !== cityName));
      } else {
        onChange([...currentValues, cityName]);
      }
    } else {
      onChange(cityName);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemove = (cityName) => {
    if (multiple) {
      onChange(value.filter(c => c !== cityName));
    }
  };

  const selectedCities = multiple ? (value || []) : (value ? [value] : []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Selected cities display (for multiple) */}
        {multiple && selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCities.map((cityName) => (
              <span
                key={cityName}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
              >
                {cityName}
                <button
                  type="button"
                  onClick={() => handleRemove(cityName)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={multiple ? searchTerm : (value || searchTerm)}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = selectedCities.includes(city.name);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city.name)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500">{city.region}</span>
                    </div>
                    {multiple && isSelected && (
                      <span className="ml-2 text-blue-600">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

CitySelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default CitySelect;
