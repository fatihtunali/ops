import { formatCurrency } from '@utils/formatters';

/**
 * StatCard component for displaying KPI statistics
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} type - Type of value: 'currency', 'number', or 'text'
 * @param {string} trend - Trend indicator: 'up', 'down', or null
 * @param {string} trendValue - Percentage or text for trend
 * @param {ReactNode} icon - Icon component
 * @param {string} iconBg - Background color for icon
 * @param {string} iconColor - Color for icon
 */
const StatCard = ({
  title,
  value,
  type = 'number',
  trend = null,
  trendValue = null,
  icon: Icon,
  iconBg = 'bg-blue-100',
  iconColor = 'text-blue-600',
  subtitle = null
}) => {
  // Format the value based on type
  const formattedValue = () => {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{formattedValue()}</p>

          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}

          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' && (
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
