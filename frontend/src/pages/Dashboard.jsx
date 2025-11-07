import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import StatCard from '@components/dashboard/StatCard';
import { LineChart, BarChart, PieChart } from '@components/charts';
import { Card, Badge, Loader } from '@components/common';
import { reportsService } from '@services/reportsService';
import { bookingsService } from '@services/bookingsService';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@utils/formatters';
import { BOOKING_STATUS_COLORS, CHART_COLORS } from '@utils/constants';
import { format, subMonths } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesByService, setSalesByService] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await reportsService.getDashboardStats();
        // Backend returns { success, data }, extract the data
        setStats(response.data || response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch chart data and recent bookings
  useEffect(() => {
    const fetchChartsData = async () => {
      try {
        setChartsLoading(true);

        // Get date range for last 6 months
        const toDate = new Date();
        const fromDate = subMonths(toDate, 6);
        const fromDateStr = format(fromDate, 'yyyy-MM-dd');
        const toDateStr = format(toDate, 'yyyy-MM-dd');

        // Fetch sales by service, cash flow, and recent bookings in parallel
        const [salesData, cashFlow, bookings] = await Promise.all([
          reportsService.getSalesByService(fromDateStr, toDateStr),
          reportsService.getCashFlow(fromDateStr, toDateStr),
          bookingsService.getRecent(5),
        ]);

        // Transform sales by service data for pie chart
        // Backend returns { success, data }, extract the data
        const salesArray = salesData?.data || salesData;
        if (salesArray && Array.isArray(salesArray)) {
          setSalesByService(
            salesArray.map((item) => ({
              name: item.service_type || 'Unknown',
              value: parseFloat(item.total_revenue) || 0,
            }))
          );
        }

        // Transform cash flow data for line chart
        const cashFlowArray = cashFlow?.data || cashFlow;
        if (cashFlowArray && Array.isArray(cashFlowArray)) {
          setCashFlowData(
            cashFlowArray.map((item) => ({
              month: item.month || '',
              revenue: parseFloat(item.total_inflow) || 0,
            }))
          );
        }

        // Set recent bookings
        const bookingsArray = bookings?.data || bookings;
        if (bookingsArray && Array.isArray(bookingsArray)) {
          setRecentBookings(bookingsArray);
        }
      } catch (err) {
        console.error('Failed to fetch charts data:', err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchChartsData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Loader fullPage text="Loading dashboard..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
          <p className="text-blue-100">Here's what's happening with your business today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Active Inquiries"
            value={stats?.active_inquiries || 0}
            type="number"
            icon={DocumentTextIcon}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            subtitle="Pending quotes & inquiries"
          />

          <StatCard
            title="This Month's Bookings"
            value={stats?.this_month?.confirmed_bookings || 0}
            type="number"
            icon={CheckCircleIcon}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            subtitle="Confirmed this month"
          />

          <StatCard
            title="This Month's Revenue"
            value={stats?.this_month?.revenue || 0}
            type="currency"
            icon={CurrencyDollarIcon}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            subtitle="Total revenue this month"
          />

          <StatCard
            title="This Month's Profit"
            value={stats?.this_month?.gross_profit || 0}
            type="currency"
            icon={ChartBarIcon}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            subtitle="Gross profit this month"
          />

          <StatCard
            title="Outstanding Receivables"
            value={stats?.outstanding?.receivables || 0}
            type="currency"
            icon={ArrowTrendingUpIcon}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            subtitle="To be collected"
          />

          <StatCard
            title="Outstanding Payables"
            value={stats?.outstanding?.payables || 0}
            type="currency"
            icon={BanknotesIcon}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            subtitle="To be paid"
          />
        </div>

        {/* Charts Section */}
        {chartsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader text="Loading charts..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card title="Revenue Trend (Last 6 Months)" padding="normal">
              <LineChart
                data={cashFlowData}
                xKey="month"
                yKey="revenue"
                color={CHART_COLORS[0]}
                height={280}
                tooltipFormatter={(value) => formatCurrency(value)}
              />
            </Card>

            {/* Sales by Service Type */}
            <Card title="Sales by Service Type" padding="normal">
              <PieChart
                data={salesByService}
                dataKey="value"
                nameKey="name"
                colors={CHART_COLORS}
                height={280}
                tooltipFormatter={(value) => formatCurrency(value)}
              />
            </Card>
          </div>
        )}

        {/* Recent Bookings */}
        <Card
          title="Recent Bookings"
          subtitle="Last 5 bookings created"
          headerAction={
            <button
              onClick={() => navigate('/bookings')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          }
          padding="none"
        >
          {recentBookings.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No recent bookings found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Booking Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      PAX
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-200">
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.booking_id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => navigate(`/bookings/${booking.booking_id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {booking.booking_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {booking.client_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {booking.pax_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={BOOKING_STATUS_COLORS[booking.status] || 'secondary'}
                          size="sm"
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {formatCurrency(booking.total_sell_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Upcoming Departures */}
        {stats?.upcoming_departures && stats.upcoming_departures.length > 0 && (
          <Card title="Upcoming Departures (Next 7 Days)" padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Booking Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Departure Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      PAX
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-200">
                  {stats.upcoming_departures.map((booking, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {booking.booking_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {booking.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatDate(booking.departure_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {booking.pax_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Quick Actions" padding="normal" className="bg-blue-50">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/bookings/create')}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-200 rounded-lg transition-colors"
              >
                + New Booking
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-200 rounded-lg transition-colors"
              >
                + New Client
              </button>
              <button
                onClick={() => navigate('/reports/profit-loss')}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-200 rounded-lg transition-colors"
              >
                View Reports
              </button>
            </div>
          </Card>

          <Card title="System Status" padding="normal" className="bg-blue-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Database</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">API Status</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Last Backup</span>
                <span className="text-sm text-slate-600">Today</span>
              </div>
            </div>
          </Card>

          <Card title="Your Account" padding="normal" className="bg-blue-50">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase">Role</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Email</p>
                <p className="text-sm font-medium text-slate-900">{user?.email}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
