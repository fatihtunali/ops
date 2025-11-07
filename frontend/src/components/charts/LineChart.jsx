import PropTypes from 'prop-types';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * LineChart Component
 * Reusable line chart for trend visualization
 */
const LineChart = ({
  data = [],
  xKey,
  yKey,
  title,
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showLegend = true,
  yAxisFormatter,
  tooltipFormatter,
  className = '',
}) => {
  // Default formatter for Y axis
  const defaultYFormatter = (value) => {
    if (typeof value === 'number' && value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // Default tooltip formatter
  const defaultTooltipFormatter = (value) => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    return value;
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
          <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}

            <XAxis
              dataKey={xKey}
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />

            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={yAxisFormatter || defaultYFormatter}
            />

            <Tooltip
              formatter={tooltipFormatter || defaultTooltipFormatter}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />

            {showLegend && <Legend />}

            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
  title: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  yAxisFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func,
  className: PropTypes.string,
};

export default LineChart;
