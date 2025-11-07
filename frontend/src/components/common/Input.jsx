import PropTypes from 'prop-types';

/**
 * Input Component
 * Reusable input field with validation, labels, and icons
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label,
  error,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  helperText,
  className = '',
  inputClassName = '',
  rows = 4,
  ...rest
}) => {
  // Base input styles
  const baseStyles = 'w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2';

  // State-dependent styles
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
    : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500 bg-white';

  // Disabled styles
  const disabledStyles = disabled
    ? 'opacity-60 cursor-not-allowed bg-slate-100'
    : '';

  // Icon padding
  const iconPaddingStyles = icon
    ? iconPosition === 'left'
      ? 'pl-10'
      : 'pr-10'
    : '';

  // Combine input classes
  const inputClasses = `${baseStyles} ${stateStyles} ${disabledStyles} ${iconPaddingStyles} ${inputClassName}`;

  // Render input or textarea
  const InputElement = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (() => {
          const Icon = icon;
          return (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="h-5 w-5" />
            </div>
          );
        })()}

        {/* Input field */}
        <InputElement
          type={type === 'textarea' ? undefined : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          rows={type === 'textarea' ? rows : undefined}
          {...rest}
        />

        {/* Right icon */}
        {icon && iconPosition === 'right' && (() => {
          const Icon = icon;
          return (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="h-5 w-5" />
            </div>
          );
        })()}
      </div>

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'datetime-local', 'textarea', 'search']),
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  helperText: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  rows: PropTypes.number,
};

export default Input;
