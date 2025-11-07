import PropTypes from 'prop-types';

/**
 * Badge Component
 * Reusable badge for status indicators and labels
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'normal',
  icon,
  iconPosition = 'left',
  dot = false,
  className = '',
  onClick,
  ...rest
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium transition-colors';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'border-2 bg-transparent',
  };

  // Outline border colors
  const outlineBorderStyles = variant === 'outline' ? {
    primary: 'border-primary-500 text-primary-700',
    secondary: 'border-secondary-500 text-secondary-700',
    success: 'border-success-500 text-success-700',
    warning: 'border-warning-500 text-warning-700',
    danger: 'border-danger-500 text-danger-700',
  } : {};

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    normal: 'rounded',
    full: 'rounded-full',
  };

  // Clickable styles
  const clickableStyles = onClick ? 'cursor-pointer hover:opacity-80' : '';

  // Dot size
  const dotSizeStyles = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  // Combine all styles
  const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${variant === 'outline' ? outlineBorderStyles[variant] || '' : ''} ${sizeStyles[size]} ${roundedStyles[rounded]} ${clickableStyles} ${className}`;

  // Dot color
  const dotColorStyles = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    danger: 'bg-danger-600',
    info: 'bg-blue-600',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={badgeClasses}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      {...rest}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={`${dotSizeStyles[size]} ${dotColorStyles[variant]} rounded-full ${iconPosition === 'left' || !children ? 'mr-1.5' : 'ml-1.5'}`}
        ></span>
      )}

      {/* Left icon */}
      {icon && iconPosition === 'left' && !dot && (() => {
        const Icon = icon;
        return (
          <span className={children ? 'mr-1.5' : ''}>
            <Icon className="h-4 w-4" />
          </span>
        );
      })()}

      {/* Badge text */}
      {children}

      {/* Right icon */}
      {icon && iconPosition === 'right' && !dot && (() => {
        const Icon = icon;
        return (
          <span className={children ? 'ml-1.5' : ''}>
            <Icon className="h-4 w-4" />
          </span>
        );
      })()}
    </Component>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  rounded: PropTypes.oneOf(['none', 'normal', 'full']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  dot: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Badge;
