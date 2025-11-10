import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { expensesService } from '@services/expensesService';
import { useToast } from '@context/ToastContext';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const ExpensesList = () => {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [recurringFilter, setRecurringFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    expense_date: '',
    category: '',
    description: '',
    amount: '',
    currency: 'EUR',
    payment_method: '',
    reference_number: '',
    is_recurring: false,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Common expense categories
  const categories = [
    'Rent',
    'Salaries',
    'Utilities',
    'Marketing',
    'Office Supplies',
    'Insurance',
    'Transportation',
    'Software & Subscriptions',
    'Professional Services',
    'Maintenance',
    'Travel',
    'Other',
  ];

  // Payment methods
  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Credit Card',
    'Debit Card',
    'Check',
    'Online Payment',
    'Other',
  ];

  // Currency exchange rates to EUR (approximate - should be updated regularly)
  const exchangeRates = {
    EUR: 1,
    USD: 0.92,    // 1 USD = 0.92 EUR
    GBP: 1.17,    // 1 GBP = 1.17 EUR
    TRY: 0.027,   // 1 TRY = 0.027 EUR
  };

  // Convert amount to EUR
  const convertToEUR = (amount, currency) => {
    const rate = exchangeRates[currency] || 1;
    return parseFloat(amount) * rate;
  };

  // Calculate totals by currency and in EUR
  const calculateTotals = () => {
    const totals = {
      EUR: 0,
      USD: 0,
      GBP: 0,
      TRY: 0,
      totalInEUR: 0,
    };

    expenses.forEach(exp => {
      const amount = parseFloat(exp.amount || 0);
      const currency = exp.currency || 'EUR';

      if (totals.hasOwnProperty(currency)) {
        totals[currency] += amount;
      }

      totals.totalInEUR += convertToEUR(amount, currency);
    });

    return totals;
  };

  // Fetch expenses
  useEffect(() => {
    fetchExpenses();
  }, [currentPage, categoryFilter, recurringFilter, dateFrom, dateTo]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (categoryFilter) params.category = categoryFilter;
      if (recurringFilter) params.is_recurring = recurringFilter === 'true';
      if (searchTerm) params.search = searchTerm;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await expensesService.getAll(params);
      const data = response?.data || response;

      if (data && Array.isArray(data.expenses || data)) {
        const expensesList = data.expenses || data;
        setExpenses(expensesList);
        setTotalCount(data.total || expensesList.length);
        setTotalPages(Math.ceil((data.total || expensesList.length) / itemsPerPage));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExpenses();
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setFormData({
      expense_date: '',
      category: '',
      description: '',
      amount: '',
      currency: 'EUR',
      payment_method: '',
      reference_number: '',
      is_recurring: false,
      notes: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);

    // Convert expense_date from YYYY-MM-DD to YYYY-MM-DD for the date input
    let expenseDate = expense.expense_date || '';
    if (expenseDate) {
      // If it's already in YYYY-MM-DD format, use it
      // If it's in another format, try to convert
      const dateObj = new Date(expenseDate);
      if (!isNaN(dateObj)) {
        expenseDate = dateObj.toISOString().split('T')[0];
      }
    }

    setFormData({
      expense_date: expenseDate,
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount || '',
      currency: expense.currency || 'EUR',
      payment_method: expense.payment_method || '',
      reference_number: expense.reference_number || '',
      is_recurring: expense.is_recurring || false,
      notes: expense.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense: "${expense.category} - ${expense.description}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await expensesService.delete(expense.id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      const errorMsg = err.message || 'Failed to delete expense. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.expense_date) {
      errors.expense_date = 'Expense date is required';
    }

    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        is_recurring: Boolean(formData.is_recurring),
      };

      if (editingExpense) {
        await expensesService.update(editingExpense.id, submitData);
        toast.success('Expense updated successfully');
      } else {
        await expensesService.create(submitData);
        toast.success('Expense created successfully');
      }

      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to save expense:', err);
      const errorMsg = err.message || 'Failed to save expense. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setRecurringFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operational Expenses</h1>
            <p className="text-gray-600 mt-1">Track and manage company operational expenses</p>
          </div>
          <Button icon={PlusIcon} onClick={handleAdd}>
            Add Expense
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  label="Search"
                  placeholder="Search by description, category, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={MagnifyingGlassIcon}
                />
              </div>
              <Button type="submit">Search</Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                <select
                  value={recurringFilter}
                  onChange={(e) => {
                    setRecurringFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Recurring Only</option>
                  <option value="false">Non-Recurring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(categoryFilter || recurringFilter || dateFrom || dateTo || searchTerm) && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Expenses List */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter || recurringFilter || dateFrom || dateTo
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first expense.'}
              </p>
              <Button icon={PlusIcon} onClick={handleAdd}>
                Add Expense
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {formatDate(expense.expense_date)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{expense.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">{expense.description || '-'}</div>
                          {expense.notes && (
                            <div className="text-xs text-gray-500 mt-1">{expense.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(expense.amount, expense.currency || 'EUR')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {expense.payment_method || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 font-mono">
                            {expense.reference_number || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {expense.is_recurring && (
                            <Badge variant="info">Recurring</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense)}
                              disabled={deleting}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {(() => {
                  const totals = calculateTotals();
                  return (
                    <div className="space-y-3">
                      {/* Currency Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(totals).filter(([key]) => key !== 'totalInEUR' && totals[key] > 0).map(([currency, amount]) => (
                          <div key={currency} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">{currency}</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(amount, currency)}
                            </div>
                            {currency !== 'EUR' && (
                              <div className="text-xs text-gray-500 mt-1">
                                ≈ {formatCurrency(convertToEUR(amount, currency), 'EUR')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Consolidated Total in EUR */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Consolidated Total (EUR)</div>
                          <div className="text-xs text-gray-500">All expenses converted to EUR</div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(totals.totalInEUR, 'EUR')}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
                        <div>{expenses.filter(exp => exp.is_recurring).length} recurring expenses</div>
                        <div className="text-xs text-gray-500">
                          Exchange rates: 1 USD = 0.92 EUR, 1 GBP = 1.17 EUR, 1 TRY = 0.027 EUR
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} expenses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Expense Date */}
            <Input
              label="Expense Date *"
              type="date"
              value={formData.expense_date}
              onChange={(e) => handleFormChange('expense_date', e.target.value)}
              error={formErrors.expense_date}
              required
            />

            {/* Category and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    required
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleFormChange('currency', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
                {formErrors.amount && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.amount}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Brief description of the expense..."
            />

            {/* Payment Method and Reference */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleFormChange('payment_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select method...</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Reference Number"
                value={formData.reference_number}
                onChange={(e) => handleFormChange('reference_number', e.target.value)}
                placeholder="Invoice/receipt number..."
              />
            </div>

            {/* Recurring Checkbox */}
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => handleFormChange('is_recurring', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
                Recurring Expense
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes or details..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ExpensesList;
