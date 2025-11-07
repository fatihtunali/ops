import PropTypes from 'prop-types';

/**
 * Card Component
 * Reusable container with optional header and footer
 */
const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'normal',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  shadow = 'md',
  hover = false,
  ...rest
}) => {
  // Base card styles
  const baseStyles = 'bg-white rounded-lg border border-blue-200';

  // Shadow styles
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8',
  };

  // Hover effect
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  // Combine card classes
  const cardClasses = `${baseStyles} ${shadowStyles[shadow]} ${hoverStyles} ${className}`;

  // Body padding
  const bodyPadding = paddingStyles[padding];

  return (
    <div className={cardClasses} {...rest}>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div
          className={`px-6 py-4 border-b border-blue-200 ${headerClassName}`}
        >
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className={`${bodyPadding} ${bodyClassName}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={`px-6 py-4 bg-blue-50 border-t border-blue-200 rounded-b-lg ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  headerAction: PropTypes.node,
  footer: PropTypes.node,
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  hover: PropTypes.bool,
};

export default Card;
