import PropTypes from 'prop-types';

/**
 * Loader Component
 * Reusable spinner with full-page and inline variants
 */
const Loader = ({
  size = 'md',
  color = 'primary',
  fullPage = false,
  text,
  className = '',
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Color styles (for the spinner)
  const colorStyles = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
    white: 'text-white',
  };

  // Spinner SVG
  const spinner = (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // Full-page loader
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-blue-100/95 to-indigo-100/95 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-4 text-sm font-medium text-slate-700">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline loader
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinner}
      {text && (
        <span className="ml-3 text-sm font-medium text-slate-700">
          {text}
        </span>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'white']),
  fullPage: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
};

export default Loader;
