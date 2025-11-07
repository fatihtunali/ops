import PropTypes from 'prop-types';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * BarChart Component
 * Reusable bar chart for comparison visualization
 */
const BarChart = ({
  data = [],
  xKey,
  yKey,
  title,
  color = '#10b981',
  height = 300,
  showGrid = true,
  showLegend = true,
  yAxisFormatter,
  tooltipFormatter,
  horizontal = false,
  className = '',
}) => {
  // Default formatter for axis
  const defaultFormatter = (value) => {
    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // Default tooltip formatter
  const defaultTooltipFormatter = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
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
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout={horizontal ? 'vertical' : 'horizontal'}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}

            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tickFormatter={yAxisFormatter || defaultFormatter}
                />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tickFormatter={yAxisFormatter || defaultFormatter}
                />
              </>
            )}

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

            <Bar
              dataKey={yKey}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

BarChart.propTypes = {
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
  horizontal: PropTypes.bool,
  className: PropTypes.string,
};

export default BarChart;
