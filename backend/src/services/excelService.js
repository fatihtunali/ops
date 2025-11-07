const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Excel Export Service
 */

// Ensure exports directory exists
const EXPORTS_DIR = path.join(__dirname, '../../exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

/**
 * Export bookings to Excel
 */
exports.exportBookings = async (bookings) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bookings');

  // Define columns
  worksheet.columns = [
    { header: 'Booking Code', key: 'booking_code', width: 15 },
    { header: 'Client Name', key: 'client_name', width: 25 },
    { header: 'Travel From', key: 'travel_date_from', width: 12 },
    { header: 'Travel To', key: 'travel_date_to', width: 12 },
    { header: 'Pax', key: 'pax_count', width: 8 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Sell Price', key: 'total_sell_price', width: 12 },
    { header: 'Cost Price', key: 'total_cost_price', width: 12 },
    { header: 'Profit', key: 'gross_profit', width: 12 },
    { header: 'Payment Status', key: 'payment_status', width: 15 },
    { header: 'Amount Received', key: 'amount_received', width: 15 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4CAF50' }
  };

  // Add data
  bookings.forEach(booking => {
    worksheet.addRow(booking);
  });

  // Format currency columns
  ['total_sell_price', 'total_cost_price', 'gross_profit', 'amount_received'].forEach(col => {
    worksheet.getColumn(col).numFmt = '$#,##0.00';
  });

  // Save file
  const fileName = `bookings_export_${Date.now()}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

/**
 * Export Monthly P&L to Excel
 */
exports.exportMonthlyPL = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly P&L');

  // Title
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = `Profit & Loss Statement - ${reportData.month}`;
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Revenue Section
  worksheet.addRow(['REVENUE', '', '']);
  worksheet.getCell('A3').font = { bold: true };
  worksheet.addRow(['Total Bookings Revenue', '', reportData.revenue.total_bookings_revenue]);
  worksheet.addRow(['Booking Count', '', reportData.revenue.booking_count]);
  worksheet.addRow([]);

  // Direct Costs Section
  worksheet.addRow(['DIRECT COSTS', '', '']);
  worksheet.getCell('A7').font = { bold: true };
  worksheet.addRow(['Hotel Costs', '', reportData.direct_costs.hotel_costs]);
  worksheet.addRow(['Tour Costs', '', reportData.direct_costs.tour_costs]);
  worksheet.addRow(['Transfer Costs', '', reportData.direct_costs.transfer_costs]);
  worksheet.addRow(['Flight Costs', '', reportData.direct_costs.flight_costs]);
  worksheet.addRow(['Total Direct Costs', '', reportData.direct_costs.total]);
  worksheet.getCell('A12').font = { bold: true };
  worksheet.addRow([]);

  // Gross Profit
  worksheet.addRow(['GROSS PROFIT', '', reportData.gross_profit]);
  worksheet.getCell('A14').font = { bold: true, color: { argb: 'FF4CAF50' } };
  worksheet.getCell('C14').font = { bold: true, color: { argb: 'FF4CAF50' } };
  worksheet.addRow([]);

  // Operational Expenses
  worksheet.addRow(['OPERATIONAL EXPENSES', '', '']);
  worksheet.getCell('A16').font = { bold: true };
  let row = 17;
  for (const [category, amount] of Object.entries(reportData.operational_expenses)) {
    if (category !== 'total') {
      worksheet.addRow([category.charAt(0).toUpperCase() + category.slice(1), '', amount]);
      row++;
    }
  }
  worksheet.addRow(['Total Operational Expenses', '', reportData.operational_expenses.total]);
  worksheet.getCell(`A${row + 1}`).font = { bold: true };
  worksheet.addRow([]);

  // Net Profit
  worksheet.addRow(['NET PROFIT', '', reportData.net_profit]);
  const netProfitRow = worksheet.lastRow;
  netProfitRow.getCell(1).font = { bold: true, size: 12, color: { argb: reportData.net_profit >= 0 ? 'FF4CAF50' : 'FFF44336' } };
  netProfitRow.getCell(3).font = { bold: true, size: 12, color: { argb: reportData.net_profit >= 0 ? 'FF4CAF50' : 'FFF44336' } };

  // Format currency column
  worksheet.getColumn('C').numFmt = '$#,##0.00';
  worksheet.getColumn('C').width = 15;
  worksheet.getColumn('A').width = 30;

  // Save file
  const fileName = `pl_report_${reportData.month}_${Date.now()}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

/**
 * Export Cash Flow Report to Excel
 */
exports.exportCashFlow = async (reportData) => {
  const workbook = new ExcelJS.Workbook();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.mergeCells('A1:C1');
  summarySheet.getCell('A1').value = `Cash Flow Report - ${reportData.period.from} to ${reportData.period.to}`;
  summarySheet.getCell('A1').font = { size: 14, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  summarySheet.addRow([]);
  summarySheet.addRow(['Total Money In', '', reportData.summary.total_money_in]);
  summarySheet.addRow(['Total Money Out', '', reportData.summary.total_money_out]);
  summarySheet.addRow(['Net Cash Flow', '', reportData.summary.net_cash_flow]);

  summarySheet.getColumn('C').numFmt = '$#,##0.00';
  summarySheet.getColumn('A').width = 20;
  summarySheet.getColumn('C').width = 15;

  // Money In Sheet
  const moneyInSheet = workbook.addWorksheet('Money In');
  moneyInSheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Booking Code', key: 'booking_code', width: 15 },
    { header: 'Client Name', key: 'client_name', width: 25 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Payment Method', key: 'payment_method', width: 15 }
  ];
  moneyInSheet.getRow(1).font = { bold: true };
  reportData.money_in.transactions.forEach(tx => {
    moneyInSheet.addRow(tx);
  });
  moneyInSheet.getColumn('amount').numFmt = '$#,##0.00';

  // Money Out Sheet
  const moneyOutSheet = workbook.addWorksheet('Money Out');
  moneyOutSheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Supplier/Category', key: 'name', width: 25 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Booking Code', key: 'booking_code', width: 15 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Payment Method', key: 'payment_method', width: 15 }
  ];
  moneyOutSheet.getRow(1).font = { bold: true };

  // Add supplier payments
  reportData.money_out.supplier_payments.transactions.forEach(tx => {
    moneyOutSheet.addRow({
      date: tx.date,
      name: tx.supplier_name,
      type: tx.supplier_type,
      booking_code: tx.booking_code,
      amount: tx.amount,
      payment_method: tx.payment_method
    });
  });

  // Add operational expenses
  reportData.money_out.operational_expenses.transactions.forEach(tx => {
    moneyOutSheet.addRow({
      date: tx.date,
      name: tx.description || tx.category,
      type: 'expense',
      booking_code: '',
      amount: tx.amount,
      payment_method: tx.payment_method
    });
  });

  moneyOutSheet.getColumn('amount').numFmt = '$#,##0.00';

  // Save file
  const fileName = `cash_flow_${Date.now()}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

/**
 * Export Sales by Client to Excel
 */
exports.exportSalesByClient = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales by Client');

  // Title
  worksheet.mergeCells('A1:G1');
  worksheet.getCell('A1').value = 'Sales Performance by Client';
  worksheet.getCell('A1').font = { size: 14, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Define columns
  worksheet.columns = [
    { header: 'Client Name', key: 'client_name', width: 25 },
    { header: 'Type', key: 'client_type', width: 12 },
    { header: 'Bookings', key: 'booking_count', width: 10 },
    { header: 'Revenue', key: 'total_revenue', width: 12 },
    { header: 'Costs', key: 'total_costs', width: 12 },
    { header: 'Profit', key: 'total_profit', width: 12 },
    { header: 'Margin %', key: 'profit_margin_percentage', width: 10 }
  ];

  // Style header row
  worksheet.getRow(3).font = { bold: true };
  worksheet.getRow(3).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4CAF50' }
  };

  // Add data
  reportData.clients.forEach(client => {
    worksheet.addRow(client);
  });

  // Format currency columns
  ['total_revenue', 'total_costs', 'total_profit'].forEach(col => {
    worksheet.getColumn(col).numFmt = '$#,##0.00';
  });
  worksheet.getColumn('profit_margin_percentage').numFmt = '0.00%';

  // Save file
  const fileName = `sales_by_client_${Date.now()}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

/**
 * Export Outstanding Payments to Excel
 */
exports.exportOutstandingPayments = async (reportData) => {
  const workbook = new ExcelJS.Workbook();

  // Receivables Sheet
  const receivablesSheet = workbook.addWorksheet('Receivables');
  receivablesSheet.columns = [
    { header: 'Booking Code', key: 'booking_code', width: 15 },
    { header: 'Client Name', key: 'client_name', width: 25 },
    { header: 'Total Amount', key: 'total_amount', width: 12 },
    { header: 'Received', key: 'amount_received', width: 12 },
    { header: 'Outstanding', key: 'outstanding_amount', width: 12 },
    { header: 'Days Outstanding', key: 'days_outstanding', width: 15 },
    { header: 'Status', key: 'payment_status', width: 12 }
  ];
  receivablesSheet.getRow(1).font = { bold: true };
  reportData.receivables.items.forEach(item => {
    receivablesSheet.addRow(item);
  });
  ['total_amount', 'amount_received', 'outstanding_amount'].forEach(col => {
    receivablesSheet.getColumn(col).numFmt = '$#,##0.00';
  });

  // Payables Sheet
  const payablesSheet = workbook.addWorksheet('Payables');
  payablesSheet.columns = [
    { header: 'Booking Code', key: 'booking_code', width: 15 },
    { header: 'Supplier Name', key: 'supplier_name', width: 25 },
    { header: 'Type', key: 'supplier_type', width: 12 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Due Date', key: 'due_date', width: 12 },
    { header: 'Days Overdue', key: 'days_overdue', width: 12 },
    { header: 'Status', key: 'status', width: 12 }
  ];
  payablesSheet.getRow(1).font = { bold: true };
  reportData.payables.items.forEach(item => {
    payablesSheet.addRow(item);
  });
  payablesSheet.getColumn('amount').numFmt = '$#,##0.00';

  // Save file
  const fileName = `outstanding_payments_${Date.now()}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
