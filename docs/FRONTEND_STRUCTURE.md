# Frontend Structure & Page Names

## Page Organization

### 📁 frontend/src/pages/

```
pages/
├── Dashboard/
│   └── Dashboard.jsx              # Main dashboard with metrics
│
├── Auth/
│   ├── Login.jsx                  # Login page
│   └── ForgotPassword.jsx         # Password recovery
│
├── Bookings/
│   ├── BookingsList.jsx           # All bookings list view
│   ├── BookingCreate.jsx          # Create new booking
│   ├── BookingDetail.jsx          # View single booking details
│   ├── BookingEdit.jsx            # Edit existing booking
│   └── BookingSearch.jsx          # Advanced search for bookings
│
├── Clients/
│   ├── ClientsList.jsx            # All clients (agents + direct)
│   ├── ClientCreate.jsx           # Add new client
│   ├── ClientDetail.jsx           # View client profile
│   ├── ClientEdit.jsx             # Edit client info
│   └── ClientPerformance.jsx      # Client performance metrics
│
├── Hotels/
│   ├── HotelsList.jsx             # Hotel database
│   ├── HotelCreate.jsx            # Add new hotel
│   ├── HotelDetail.jsx            # Hotel details & history
│   └── HotelEdit.jsx              # Edit hotel info
│
├── Tours/
│   ├── TourSuppliersList.jsx     # Tour suppliers database
│   ├── TourSupplierCreate.jsx    # Add new tour supplier
│   ├── TourSupplierDetail.jsx    # Supplier details
│   └── TourSupplierEdit.jsx      # Edit supplier info
│
├── Guides/
│   ├── GuidesList.jsx             # All guides database
│   ├── GuideCreate.jsx            # Add new guide
│   ├── GuideDetail.jsx            # Guide profile & assignments
│   ├── GuideEdit.jsx              # Edit guide info
│   └── GuideCalendar.jsx          # Guide availability calendar
│
├── Vehicles/
│   ├── VehiclesList.jsx           # All vehicles database
│   ├── VehicleCreate.jsx          # Add new vehicle
│   ├── VehicleDetail.jsx          # Vehicle details & schedule
│   ├── VehicleEdit.jsx            # Edit vehicle info
│   └── VehicleCalendar.jsx        # Vehicle availability calendar
│
├── Payments/
│   ├── PaymentsDashboard.jsx     # Payments overview
│   ├── ClientPayments.jsx         # Record client payments
│   ├── SupplierPayments.jsx       # Record supplier payments
│   ├── PaymentHistory.jsx         # All payment transactions
│   ├── Receivables.jsx            # Outstanding client payments
│   └── Payables.jsx               # Outstanding supplier payments
│
├── Expenses/
│   ├── ExpensesList.jsx           # Operational expenses list
│   ├── ExpenseCreate.jsx          # Add new expense
│   ├── ExpenseEdit.jsx            # Edit expense
│   └── ExpenseCategories.jsx      # Manage expense categories
│
├── Reports/
│   ├── ReportsDashboard.jsx      # Reports home
│   ├── ProfitLossReport.jsx      # Monthly P&L report
│   ├── CashFlowReport.jsx        # Cash flow analysis
│   ├── BookingProfitability.jsx  # Per-booking profit analysis
│   ├── SalesByClient.jsx         # Sales performance by client
│   ├── SalesByService.jsx        # Sales by service type
│   ├── OutstandingReport.jsx     # Outstanding payments report
│   └── MonthlyComparison.jsx     # Month-over-month comparison
│
├── Vouchers/
│   ├── VouchersList.jsx           # All generated vouchers
│   ├── VoucherGenerate.jsx        # Generate new vouchers
│   └── VoucherPreview.jsx         # Preview before sending
│
├── Users/
│   ├── UsersList.jsx              # User management (admin only)
│   ├── UserCreate.jsx             # Add new user
│   ├── UserEdit.jsx               # Edit user
│   └── UserPermissions.jsx        # Manage user roles & permissions
│
└── Settings/
    ├── CompanySettings.jsx        # Company info, logo, etc.
    ├── SystemSettings.jsx         # System configuration
    ├── EmailTemplates.jsx         # Email template editor
    ├── VoucherTemplates.jsx       # Voucher template editor
    └── BackupRestore.jsx          # Database backup & restore
```

---

## Component Organization

### 📁 frontend/src/components/

```
components/
├── Layout/
│   ├── MainLayout.jsx             # Main application layout
│   ├── Navbar.jsx                 # Top navigation bar
│   ├── Sidebar.jsx                # Left sidebar navigation
│   └── Footer.jsx                 # Footer component
│
├── Booking/
│   ├── BookingCard.jsx            # Booking summary card
│   ├── BookingStatusBadge.jsx    # Status indicator badge
│   ├── BookingServiceList.jsx    # List of services in booking
│   ├── AddHotelService.jsx       # Form to add hotel to booking
│   ├── AddTourService.jsx        # Form to add tour to booking
│   ├── AddTransferService.jsx    # Form to add transfer to booking
│   ├── AddFlightService.jsx      # Form to add flight to booking
│   ├── ServiceCard.jsx           # Individual service display card
│   ├── PricingSummary.jsx        # Cost/sell/margin summary
│   └── PassengerForm.jsx         # Add/edit passengers
│
├── Client/
│   ├── ClientCard.jsx             # Client info card
│   ├── ClientTypeBadge.jsx       # Agent/Direct badge
│   ├── ClientSelector.jsx        # Dropdown to select client
│   └── ClientStats.jsx           # Client statistics widget
│
├── Payment/
│   ├── PaymentForm.jsx            # Payment recording form
│   ├── PaymentHistoryTable.jsx   # Payment history table
│   ├── PaymentStatusBadge.jsx    # Payment status indicator
│   ├── OutstandingCard.jsx       # Outstanding payment card
│   └── PaymentMethodIcon.jsx     # Payment method icons
│
├── Resource/
│   ├── GuideCard.jsx              # Guide info card
│   ├── VehicleCard.jsx            # Vehicle info card
│   ├── ResourceSelector.jsx      # Resource selection dropdown
│   ├── AvailabilityCalendar.jsx  # Availability calendar widget
│   └── ResourceStatusBadge.jsx   # Available/Busy status
│
├── Report/
│   ├── ReportCard.jsx             # Report summary card
│   ├── ProfitChart.jsx            # Profit trend chart
│   ├── RevenueChart.jsx           # Revenue chart
│   ├── BookingVolumeChart.jsx    # Booking volume chart
│   ├── ExportButton.jsx          # Export to Excel button
│   └── DateRangePicker.jsx       # Date range selector
│
├── Voucher/
│   ├── VoucherCard.jsx            # Voucher summary card
│   ├── VoucherPreviewModal.jsx   # PDF preview modal
│   └── VoucherSendForm.jsx       # Email voucher form
│
├── Common/
│   ├── Button.jsx                 # Reusable button component
│   ├── Input.jsx                  # Form input component
│   ├── Select.jsx                 # Dropdown select component
│   ├── DatePicker.jsx             # Date picker component
│   ├── Table.jsx                  # Reusable table component
│   ├── Modal.jsx                  # Modal dialog component
│   ├── Alert.jsx                  # Alert/notification component
│   ├── LoadingSpinner.jsx        # Loading indicator
│   ├── EmptyState.jsx            # Empty state placeholder
│   ├── Pagination.jsx            # Pagination component
│   ├── SearchBar.jsx             # Search input
│   ├── FilterDropdown.jsx        # Filter dropdown
│   └── Card.jsx                  # Generic card container
│
└── Dashboard/
    ├── MetricCard.jsx             # KPI metric card
    ├── UpcomingDepartures.jsx    # Upcoming tours widget
    ├── QuickActions.jsx          # Quick action buttons
    ├── RecentBookings.jsx        # Recent bookings list
    └── OutstandingSummary.jsx    # Outstanding payments summary
```

---

## Routing Structure

### Main Routes

```javascript
// Example routing structure
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      // Dashboard
      { path: '/', element: Dashboard },

      // Bookings
      { path: '/bookings', element: BookingsList },
      { path: '/bookings/create', element: BookingCreate },
      { path: '/bookings/:id', element: BookingDetail },
      { path: '/bookings/:id/edit', element: BookingEdit },
      { path: '/bookings/search', element: BookingSearch },

      // Clients
      { path: '/clients', element: ClientsList },
      { path: '/clients/create', element: ClientCreate },
      { path: '/clients/:id', element: ClientDetail },
      { path: '/clients/:id/edit', element: ClientEdit },
      { path: '/clients/:id/performance', element: ClientPerformance },

      // Hotels
      { path: '/hotels', element: HotelsList },
      { path: '/hotels/create', element: HotelCreate },
      { path: '/hotels/:id', element: HotelDetail },
      { path: '/hotels/:id/edit', element: HotelEdit },

      // Tour Suppliers
      { path: '/tour-suppliers', element: TourSuppliersList },
      { path: '/tour-suppliers/create', element: TourSupplierCreate },
      { path: '/tour-suppliers/:id', element: TourSupplierDetail },
      { path: '/tour-suppliers/:id/edit', element: TourSupplierEdit },

      // Guides
      { path: '/guides', element: GuidesList },
      { path: '/guides/create', element: GuideCreate },
      { path: '/guides/:id', element: GuideDetail },
      { path: '/guides/:id/edit', element: GuideEdit },
      { path: '/guides/calendar', element: GuideCalendar },

      // Vehicles
      { path: '/vehicles', element: VehiclesList },
      { path: '/vehicles/create', element: VehicleCreate },
      { path: '/vehicles/:id', element: VehicleDetail },
      { path: '/vehicles/:id/edit', element: VehicleEdit },
      { path: '/vehicles/calendar', element: VehicleCalendar },

      // Payments
      { path: '/payments', element: PaymentsDashboard },
      { path: '/payments/client', element: ClientPayments },
      { path: '/payments/supplier', element: SupplierPayments },
      { path: '/payments/history', element: PaymentHistory },
      { path: '/payments/receivables', element: Receivables },
      { path: '/payments/payables', element: Payables },

      // Expenses
      { path: '/expenses', element: ExpensesList },
      { path: '/expenses/create', element: ExpenseCreate },
      { path: '/expenses/:id/edit', element: ExpenseEdit },
      { path: '/expenses/categories', element: ExpenseCategories },

      // Reports
      { path: '/reports', element: ReportsDashboard },
      { path: '/reports/profit-loss', element: ProfitLossReport },
      { path: '/reports/cash-flow', element: CashFlowReport },
      { path: '/reports/profitability', element: BookingProfitability },
      { path: '/reports/sales-by-client', element: SalesByClient },
      { path: '/reports/sales-by-service', element: SalesByService },
      { path: '/reports/outstanding', element: OutstandingReport },
      { path: '/reports/comparison', element: MonthlyComparison },

      // Vouchers
      { path: '/vouchers', element: VouchersList },
      { path: '/vouchers/generate/:bookingId', element: VoucherGenerate },
      { path: '/vouchers/:id/preview', element: VoucherPreview },

      // Users (Admin only)
      { path: '/users', element: UsersList },
      { path: '/users/create', element: UserCreate },
      { path: '/users/:id/edit', element: UserEdit },
      { path: '/users/permissions', element: UserPermissions },

      // Settings
      { path: '/settings/company', element: CompanySettings },
      { path: '/settings/system', element: SystemSettings },
      { path: '/settings/email-templates', element: EmailTemplates },
      { path: '/settings/voucher-templates', element: VoucherTemplates },
      { path: '/settings/backup', element: BackupRestore },
    ]
  },

  // Auth routes (no layout)
  { path: '/login', element: Login },
  { path: '/forgot-password', element: ForgotPassword },
];
```

---

## Naming Conventions

### Files
- **PascalCase** for component files: `BookingsList.jsx`, `ClientCreate.jsx`
- **kebab-case** for routes: `/bookings/create`, `/clients/:id/edit`
- **camelCase** for utilities: `formatCurrency.js`, `calculateProfit.js`

### Components
- Use descriptive, action-oriented names
- Page components end with action/noun: `BookingsList`, `ClientCreate`, `ReportsDashboard`
- Reusable components: Generic names like `Card`, `Button`, `Modal`

### Props
- Use descriptive prop names: `bookingId`, `clientData`, `onSubmit`, `isLoading`

---

## State Management

```
src/
├── context/              # React Context for global state
│   ├── AuthContext.jsx   # Authentication state
│   ├── BookingContext.jsx # Current booking state
│   └── ThemeContext.jsx  # UI theme state
│
└── hooks/                # Custom React hooks
    ├── useAuth.js        # Authentication hook
    ├── useBooking.js     # Booking operations
    ├── usePayment.js     # Payment operations
    └── useReport.js      # Report generation
```

---

## API Services

```
src/services/
├── api.js                # Axios instance configuration
├── authService.js        # Authentication API calls
├── bookingService.js     # Booking CRUD operations
├── clientService.js      # Client CRUD operations
├── hotelService.js       # Hotel CRUD operations
├── guideService.js       # Guide CRUD operations
├── vehicleService.js     # Vehicle CRUD operations
├── paymentService.js     # Payment operations
├── expenseService.js     # Expense operations
├── reportService.js      # Report generation
└── voucherService.js     # Voucher generation
```

---

## Utilities

```
src/utils/
├── formatters.js         # Format currency, dates, etc.
├── validators.js         # Form validation functions
├── calculations.js       # Profit, margin calculations
├── constants.js          # App constants (status values, etc.)
├── permissions.js        # Role-based permission checks
└── export.js            # Excel export utilities
```

---

**Last Updated:** 2025-12-06
**Purpose:** Define clear, descriptive names for all pages and components
