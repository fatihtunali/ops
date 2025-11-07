import PropTypes from 'prop-types';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * PieChart Component
 * Reusable pie chart for proportion visualization
 */
const PieChart = ({
  data = [],
  dataKey,
  nameKey,
  title,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  height = 300,
  showLegend = true,
  showLabels = true,
  tooltipFormatter,
  className = '',
}) => {
  // Default tooltip formatter
  const defaultTooltipFormatter = (value) => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    return value;
  };

  // Calculate percentage for labels
  const total = data.reduce((sum, entry) => sum + (entry[dataKey] || 0), 0);

  const renderLabel = (entry) => {
    if (!showLabels) return null;
    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      )}

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={renderLabel}
              labelLine={showLabels}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={tooltipFormatter || defaultTooltipFormatter}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />

            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const entry = data.find(d => d[nameKey] === value);
                  if (entry) {
                    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
                    return `${value} (${percent}%)`;
                  }
                  return value;
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string.isRequired,
  nameKey: PropTypes.string.isRequired,
  title: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  showLabels: PropTypes.bool,
  tooltipFormatter: PropTypes.func,
  className: PropTypes.string,
};

export default PieChart;
