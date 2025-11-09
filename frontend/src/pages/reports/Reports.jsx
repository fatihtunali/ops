import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Loader } from '@components/common';
import { reportsService } from '@services/reportsService';
import { formatCurrency, formatDate, formatNumber } from '@utils/formatters';
import {
  DocumentChartBarIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('pl'); // pl, cashflow, sales, outstanding
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // P&L State
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [plData, setPlData] = useState(null);

  // Cash Flow State
  const [cashFlowFrom, setCashFlowFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [cashFlowTo, setCashFlowTo] = useState(new Date().toISOString().split('T')[0]);
  const [cashFlowData, setCashFlowData] = useState(null);

  // Sales State
  const [salesFrom, setSalesFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [salesTo, setSalesTo] = useState(new Date().toISOString().split('T')[0]);
  const [salesByClient, setSalesByClient] = useState([]);
  const [salesByService, setSalesByService] = useState([]);
  const [salesBySource, setSalesBySource] = useState([]);

  // Outstanding State
  const [outstandingData, setOutstandingData] = useState(null);

  useEffect(() => {
    // Load initial data based on active tab
    if (activeTab === 'pl') {
      fetchPLReport();
    } else if (activeTab === 'cashflow') {
      fetchCashFlowReport();
    } else if (activeTab === 'sales') {
      fetchSalesReports();
    } else if (activeTab === 'outstanding') {
      fetchOutstandingReport();
    }
  }, [activeTab]);

  const fetchPLReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getMonthlyPL(selectedMonth);
      setPlData(response?.data || response);
    } catch (err) {
      console.error('Failed to fetch P&L report:', err);
      setError('Failed to load P&L report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCashFlowReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getCashFlow(cashFlowFrom, cashFlowTo);
      setCashFlowData(response?.data || response);
    } catch (err) {
      console.error('Failed to fetch cash flow report:', err);
      setError('Failed to load cash flow report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientResponse, serviceResponse, sourceResponse] = await Promise.all([
        reportsService.getSalesByClient(salesFrom, salesTo),
        reportsService.getSalesByService(salesFrom, salesTo),
        reportsService.getSalesBySource(salesFrom, salesTo),
      ]);
      setSalesByClient(clientResponse?.data || clientResponse || []);
      setSalesByService(serviceResponse?.data || serviceResponse || []);
      setSalesBySource(sourceResponse?.data || sourceResponse || []);
    } catch (err) {
      console.error('Failed to fetch sales reports:', err);
      setError('Failed to load sales reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstandingReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getOutstanding();
      setOutstandingData(response?.data || response);
    } catch (err) {
      console.error('Failed to fetch outstanding report:', err);
      setError('Failed to load outstanding report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pl', label: 'Profit & Loss', icon: DocumentChartBarIcon },
    { id: 'cashflow', label: 'Cash Flow', icon: BanknotesIcon },
    { id: 'sales', label: 'Sales Reports', icon: ChartBarIcon },
    { id: 'outstanding', label: 'Outstanding', icon: ExclamationTriangleIcon },
  ];

  const renderPLReport = () => (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPLReport}>Load Report</Button>
            <Button variant="secondary" icon={ArrowDownTrayIcon}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* P&L Summary */}
      {plData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(plData.revenue?.total_bookings_revenue || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Cost</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(plData.direct_costs?.total || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${(plData.net_profit || 0) >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                  <BanknotesIcon className={`w-8 h-8 ${(plData.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${(plData.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(plData.net_profit || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Number of Bookings</span>
                <span className="font-semibold">{plData.revenue?.booking_count || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Average Booking Value</span>
                <span className="font-semibold">
                  {formatCurrency((plData.revenue?.total_bookings_revenue || 0) / (plData.revenue?.booking_count || 1))}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Gross Profit</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(plData.gross_profit || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Operational Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(plData.operational_expenses?.total || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Profit Margin</span>
                <span className="font-semibold">
                  {(plData.revenue?.total_bookings_revenue || 0) > 0
                    ? `${(((plData.net_profit || 0) / (plData.revenue?.total_bookings_revenue || 1)) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const renderCashFlowReport = () => (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
              <input
                type="date"
                value={cashFlowFrom}
                onChange={(e) => setCashFlowFrom(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
              <input
                type="date"
                value={cashFlowTo}
                onChange={(e) => setCashFlowTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchCashFlowReport}>Load Report</Button>
            <Button variant="secondary" icon={ArrowDownTrayIcon}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Cash Flow Summary */}
      {cashFlowData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Inflow</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(cashFlowData.total_inflow || 0)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Outflow</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(cashFlowData.total_outflow || 0)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${(cashFlowData.net_cash_flow || 0) >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                  <BanknotesIcon className={`w-8 h-8 ${(cashFlowData.net_cash_flow || 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${(cashFlowData.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlowData.net_cash_flow || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Client Payments Received</span>
                <span className="font-semibold text-green-600">{formatCurrency(cashFlowData.client_payments || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Supplier Payments Made</span>
                <span className="font-semibold text-red-600">{formatCurrency(cashFlowData.supplier_payments || 0)}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const renderSalesReports = () => (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
              <input
                type="date"
                value={salesFrom}
                onChange={(e) => setSalesFrom(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
              <input
                type="date"
                value={salesTo}
                onChange={(e) => setSalesTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSalesReports}>Load Report</Button>
            <Button variant="secondary" icon={ArrowDownTrayIcon}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Sales by Source (Agent vs Direct) */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Booking Source</h3>
        {salesBySource.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Avg Booking Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salesBySource.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      {item.booking_source === 'agent' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Agent Bookings
                        </span>
                      ) : item.booking_source === 'direct' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Direct Bookings
                        </span>
                      ) : (
                        <span className="font-medium text-slate-900">{item.booking_source}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.booking_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(item.total_revenue)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(item.total_profit)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.avg_booking_value)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.profit_margin_percentage}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                <tr>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">TOTAL</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                    {salesBySource.reduce((sum, item) => sum + item.booking_count, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {formatCurrency(salesBySource.reduce((sum, item) => sum + item.total_revenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    {formatCurrency(salesBySource.reduce((sum, item) => sum + item.total_profit, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                    {formatCurrency(
                      salesBySource.reduce((sum, item) => sum + item.total_revenue, 0) /
                      salesBySource.reduce((sum, item) => sum + item.booking_count, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                    {salesBySource.reduce((sum, item) => sum + item.total_revenue, 0) > 0
                      ? ((salesBySource.reduce((sum, item) => sum + item.total_profit, 0) /
                          salesBySource.reduce((sum, item) => sum + item.total_revenue, 0)) * 100).toFixed(2)
                      : 0}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-600 py-8">No sales data available for this period</p>
        )}
      </Card>

      {/* Sales by Client */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Client</h3>
        {salesByClient.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Avg Booking Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salesByClient.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.client_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.booking_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(item.total_revenue)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.avg_booking_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-600 py-8">No sales data available for this period</p>
        )}
      </Card>

      {/* Sales by Service */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Service Type</h3>
        {salesByService.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Service Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salesByService.map((item, index) => {
                  const totalRevenue = salesByService.reduce((sum, s) => sum + parseFloat(s.total_revenue || 0), 0);
                  const percentage = totalRevenue > 0 ? ((item.total_revenue / totalRevenue) * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.service_type}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.service_count}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(item.total_revenue)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-600 py-8">No sales data available for this period</p>
        )}
      </Card>
    </div>
  );

  const renderOutstandingReport = () => (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Outstanding Receivables & Payables</h3>
            <p className="text-sm text-slate-600 mt-1">Current outstanding amounts</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchOutstandingReport}>Refresh</Button>
            <Button variant="secondary" icon={ArrowDownTrayIcon}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {outstandingData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Receivables</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(outstandingData.total_receivables || 0)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BanknotesIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Payables</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(outstandingData.total_payables || 0)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Outstanding Receivables */}
          {outstandingData.receivables && outstandingData.receivables.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Outstanding Receivables (Client Payments)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {outstandingData.receivables.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.booking_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.client_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.total_price)}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(item.paid)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-yellow-600">{formatCurrency(item.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Outstanding Payables */}
          {outstandingData.payables && outstandingData.payables.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Outstanding Payables (Supplier Payments)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {outstandingData.payables.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.booking_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.supplier_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.total_cost)}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(item.paid)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-yellow-600">{formatCurrency(item.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Financial reports and analytics</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => {
                if (activeTab === 'pl') fetchPLReport();
                else if (activeTab === 'cashflow') fetchCashFlowReport();
                else if (activeTab === 'sales') fetchSalesReports();
                else if (activeTab === 'outstanding') fetchOutstandingReport();
              }} className="mt-4">
                Retry
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {activeTab === 'pl' && renderPLReport()}
            {activeTab === 'cashflow' && renderCashFlowReport()}
            {activeTab === 'sales' && renderSalesReports()}
            {activeTab === 'outstanding' && renderOutstandingReport()}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports;
