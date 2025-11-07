const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all operational expenses with optional filters
 * GET /api/operational-expenses
 * Query params: category, from_date, to_date, is_recurring
 */
exports.getAllExpenses = async (req, res) => {
  try {
    const { category, from_date, to_date, is_recurring } = req.query;

    let sqlQuery = `
      SELECT id, expense_date, category, description, amount, currency,
             payment_method, reference_number, is_recurring, notes, created_at
      FROM operational_expenses
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Filter by category
    if (category) {
      sqlQuery += ` AND category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    // Filter by date range - from_date
    if (from_date) {
      sqlQuery += ` AND expense_date >= $${paramCount}`;
      params.push(from_date);
      paramCount++;
    }

    // Filter by date range - to_date
    if (to_date) {
      sqlQuery += ` AND expense_date <= $${paramCount}`;
      params.push(to_date);
      paramCount++;
    }

    // Filter by is_recurring
    if (is_recurring !== undefined) {
      sqlQuery += ` AND is_recurring = $${paramCount}`;
      params.push(is_recurring === 'true' || is_recurring === true);
      paramCount++;
    }

    sqlQuery += ' ORDER BY expense_date DESC, created_at DESC';

    const result = await query(sqlQuery, params);

    // Format dates and convert decimal to number
    const expenses = result.rows.map(expense => ({
      ...expense,
      amount: expense.amount ? parseFloat(expense.amount) : null,
      expense_date: expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(expense.created_at)
    }));

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch operational expenses'
      }
    });
  }
};

/**
 * Get recurring expenses only
 * GET /api/operational-expenses/recurring
 */
exports.getRecurringExpenses = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, expense_date, category, description, amount, currency,
              payment_method, reference_number, is_recurring, notes, created_at
       FROM operational_expenses
       WHERE is_recurring = true
       ORDER BY category, expense_date DESC`,
      []
    );

    // Format dates and convert decimal to number
    const expenses = result.rows.map(expense => ({
      ...expense,
      amount: expense.amount ? parseFloat(expense.amount) : null,
      expense_date: expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(expense.created_at)
    }));

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    console.error('Get recurring expenses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch recurring expenses'
      }
    });
  }
};

/**
 * Get expenses by category
 * GET /api/operational-expenses/by-category/:category
 */
exports.getExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const result = await query(
      `SELECT id, expense_date, category, description, amount, currency,
              payment_method, reference_number, is_recurring, notes, created_at
       FROM operational_expenses
       WHERE category ILIKE $1
       ORDER BY expense_date DESC`,
      [`%${category}%`]
    );

    // Format dates and convert decimal to number
    const expenses = result.rows.map(expense => ({
      ...expense,
      amount: expense.amount ? parseFloat(expense.amount) : null,
      expense_date: expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(expense.created_at)
    }));

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    console.error('Get expenses by category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch expenses by category'
      }
    });
  }
};

/**
 * Get single expense by ID
 * GET /api/operational-expenses/:id
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, expense_date, category, description, amount, currency,
              payment_method, reference_number, is_recurring, notes, created_at
       FROM operational_expenses
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Operational expense not found'
        }
      });
    }

    const expense = result.rows[0];
    expense.amount = expense.amount ? parseFloat(expense.amount) : null;
    expense.expense_date = expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null;
    expense.created_at = formatDateTime(expense.created_at);

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch operational expense'
      }
    });
  }
};

/**
 * Create new operational expense
 * POST /api/operational-expenses
 */
exports.createExpense = async (req, res) => {
  try {
    const {
      expense_date,
      category,
      description,
      amount,
      currency,
      payment_method,
      reference_number,
      is_recurring,
      notes
    } = req.body;

    // Validation
    if (!expense_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Expense date is required'
        }
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Category is required'
        }
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount is required'
        }
      });
    }

    // Validate amount > 0
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be greater than 0'
        }
      });
    }

    // Insert new expense
    const result = await query(
      `INSERT INTO operational_expenses (
        expense_date, category, description, amount, currency,
        payment_method, reference_number, is_recurring, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, expense_date, category, description, amount, currency,
                payment_method, reference_number, is_recurring, notes, created_at`,
      [
        expense_date,
        category,
        description || null,
        amount,
        currency || 'USD',
        payment_method || null,
        reference_number || null,
        is_recurring || false,
        notes || null
      ]
    );

    const newExpense = result.rows[0];
    newExpense.amount = newExpense.amount ? parseFloat(newExpense.amount) : null;
    newExpense.expense_date = newExpense.expense_date ? newExpense.expense_date.toISOString().split('T')[0] : null;
    newExpense.created_at = formatDateTime(newExpense.created_at);

    res.status(201).json({
      success: true,
      message: 'Operational expense created successfully',
      data: newExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);

    // Handle check constraint violation (amount > 0)
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be greater than 0'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create operational expense'
      }
    });
  }
};

/**
 * Update operational expense
 * PUT /api/operational-expenses/:id
 */
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      expense_date,
      category,
      description,
      amount,
      currency,
      payment_method,
      reference_number,
      is_recurring,
      notes
    } = req.body;

    // Validate amount if provided
    if (amount !== undefined && parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be greater than 0'
        }
      });
    }

    // Check if expense exists
    const existingExpense = await query(
      'SELECT id FROM operational_expenses WHERE id = $1',
      [id]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Operational expense not found'
        }
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (expense_date !== undefined) {
      updateFields.push(`expense_date = $${paramCount}`);
      params.push(expense_date);
      paramCount++;
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }
    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      params.push(amount);
      paramCount++;
    }
    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCount}`);
      params.push(currency);
      paramCount++;
    }
    if (payment_method !== undefined) {
      updateFields.push(`payment_method = $${paramCount}`);
      params.push(payment_method);
      paramCount++;
    }
    if (reference_number !== undefined) {
      updateFields.push(`reference_number = $${paramCount}`);
      params.push(reference_number);
      paramCount++;
    }
    if (is_recurring !== undefined) {
      updateFields.push(`is_recurring = $${paramCount}`);
      params.push(is_recurring);
      paramCount++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    // Add ID parameter
    params.push(id);

    const result = await query(
      `UPDATE operational_expenses
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, expense_date, category, description, amount, currency,
                 payment_method, reference_number, is_recurring, notes, created_at`,
      params
    );

    const updatedExpense = result.rows[0];
    updatedExpense.amount = updatedExpense.amount ? parseFloat(updatedExpense.amount) : null;
    updatedExpense.expense_date = updatedExpense.expense_date ? updatedExpense.expense_date.toISOString().split('T')[0] : null;
    updatedExpense.created_at = formatDateTime(updatedExpense.created_at);

    res.json({
      success: true,
      message: 'Operational expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);

    // Handle check constraint violation (amount > 0)
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be greater than 0'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update operational expense'
      }
    });
  }
};

/**
 * Delete operational expense
 * DELETE /api/operational-expenses/:id
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense exists
    const existingExpense = await query(
      'SELECT id FROM operational_expenses WHERE id = $1',
      [id]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Operational expense not found'
        }
      });
    }

    // Hard delete
    await query(
      'DELETE FROM operational_expenses WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Operational expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete operational expense'
      }
    });
  }
};

/**
 * Get expense summary by year
 * GET /api/operational-expenses/summary?year=2025
 */
exports.getExpenseSummary = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Get total expenses by category for the year
    const summaryQuery = `
      SELECT
        category,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount
      FROM operational_expenses
      WHERE EXTRACT(YEAR FROM expense_date) = $1
      GROUP BY category
      ORDER BY total_amount DESC
    `;

    const summaryResult = await query(summaryQuery, [year]);

    // Get monthly breakdown
    const monthlyQuery = `
      SELECT
        EXTRACT(MONTH FROM expense_date) as month,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as count
      FROM operational_expenses
      WHERE EXTRACT(YEAR FROM expense_date) = $1
      GROUP BY EXTRACT(MONTH FROM expense_date)
      ORDER BY month
    `;

    const monthlyResult = await query(monthlyQuery, [year]);

    // Get total summary
    const totalQuery = `
      SELECT
        COUNT(*) as total_count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN is_recurring THEN amount ELSE 0 END), 0) as recurring_amount,
        COALESCE(SUM(CASE WHEN NOT is_recurring THEN amount ELSE 0 END), 0) as one_time_amount
      FROM operational_expenses
      WHERE EXTRACT(YEAR FROM expense_date) = $1
    `;

    const totalResult = await query(totalQuery, [year]);

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        summary: totalResult.rows[0],
        by_category: summaryResult.rows,
        by_month: monthlyResult.rows
      }
    });
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get expense summary'
      }
    });
  }
};
