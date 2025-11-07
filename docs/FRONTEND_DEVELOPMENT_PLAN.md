# Frontend Development Plan - Funny Tourism Operations

## Overview

Building a comprehensive React-based frontend for the tourism operations management system, integrating with the fully operational backend (34 API endpoints, 100% tested).

**Tech Stack:** React 18 + Vite + Tailwind CSS + shadcn/ui + React Router + Axios

**Timeline:** Aligned with 12-week development plan (Backend complete, now starting frontend)

**Target:** 5 concurrent users, ~30 bookings/month

---

## Architecture

### Application Type
**Client-Side Rendered SPA with Multi-Route Navigation**

- React Router provides multiple distinct pages
- Client-side routing for fast navigation
- Protected routes with JWT authentication
- Persistent auth state across page refreshes

### Folder Structure

```
frontend/
├── src/
│   ├── components/              # Reusable components
│   │   ├── common/              # Shared UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── layout/              # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── forms/               # Form components
│   │   │   ├── ClientForm.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── PaymentForm.jsx
│   │   │   └── ExpenseForm.jsx
│   │   └── charts/              # Chart components
│   │       ├── LineChart.jsx
│   │       ├── BarChart.jsx
│   │       └── PieChart.jsx
│   │
│   ├── pages/                   # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── bookings/
│   │   │   ├── BookingsList.jsx
│   │   │   ├── BookingDetails.jsx
│   │   │   ├── CreateBooking.jsx
│   │   │   └── EditBooking.jsx
│   │   ├── clients/
│   │   │   ├── ClientsList.jsx
│   │   │   ├── ClientDetails.jsx
│   │   │   └── ClientForm.jsx
│   │   ├── hotels/
│   │   │   ├── HotelsList.jsx
│   │   │   └── HotelForm.jsx
│   │   ├── tours/
│   │   │   ├── TourSuppliersList.jsx
│   │   │   └── TourSupplierForm.jsx
│   │   ├── resources/
│   │   │   ├── GuidesList.jsx
│   │   │   ├── VehiclesList.jsx
│   │   │   ├── GuideForm.jsx
│   │   │   └── VehicleForm.jsx
│   │   ├── payments/
│   │   │   ├── ClientPayments.jsx
│   │   │   ├── SupplierPayments.jsx
│   │   │   └── PaymentForm.jsx
│   │   ├── expenses/
│   │   │   ├── ExpensesList.jsx
│   │   │   └── ExpenseForm.jsx
│   │   ├── reports/
│   │   │   ├── ProfitAndLoss.jsx
│   │   │   ├── CashFlow.jsx
│   │   │   ├── SalesReports.jsx
│   │   │   └── Outstanding.jsx
│   │   ├── vouchers/
│   │   │   └── VoucherGenerator.jsx
│   │   └── users/
│   │       └── UserManagement.jsx
│   │
│   ├── services/                # API service layer
│   │   ├── api.js               # Axios instance + interceptors
│   │   ├── authService.js       # Authentication APIs
│   │   ├── bookingService.js    # Booking APIs
│   │   ├── clientService.js     # Client APIs
│   │   ├── hotelService.js      # Hotel APIs
│   │   ├── tourService.js       # Tour supplier APIs
│   │   ├── resourceService.js   # Guides & vehicles APIs
│   │   ├── paymentService.js    # Payment APIs
│   │   ├── expenseService.js    # Expense APIs
│   │   ├── reportService.js     # Report APIs
│   │   ├── voucherService.js    # Voucher APIs
│   │   └── userService.js       # User management APIs
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Authentication hook
│   │   ├── useFetch.js          # Data fetching hook
│   │   ├── useForm.js           # Form handling hook
│   │   └── useDebounce.js       # Debounce hook
│   │
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx      # Auth state management
│   │   └── ThemeContext.jsx     # Theme management
│   │
│   ├── utils/                   # Helper functions
│   │   ├── formatters.js        # Date, currency formatters
│   │   ├── validators.js        # Form validators
│   │   ├── constants.js         # App constants
│   │   └── exportExcel.js       # Excel export utility
│   │
│   ├── assets/                  # Static assets
│   │   ├── images/
│   │   │   └── logo.png
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # Entry point
│   └── router.jsx               # Route definitions
│
├── public/                      # Public static files
│   └── favicon.ico
│
├── .env.example                 # Environment variables template
├── .env                         # Local environment (git-ignored)
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## Phase-by-Phase Implementation

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up project infrastructure and authentication

#### 1.1 Project Setup
- [x] Backend complete (34 APIs tested)
- [ ] Initialize Vite + React project
- [ ] Install dependencies (Tailwind, shadcn/ui, React Router, Axios)
- [ ] Configure Tailwind CSS
- [ ] Set up shadcn/ui components
- [ ] Create folder structure
- [ ] Configure environment variables

#### 1.2 Authentication System
- [ ] Create AuthContext for state management
- [ ] Build Login page with form validation
- [ ] Implement JWT token storage (localStorage)
- [ ] Create axios interceptors for token injection
- [ ] Implement token refresh logic
- [ ] Create ProtectedRoute component
- [ ] Build Logout functionality
- [ ] Test authentication flow

#### 1.3 Layout Components
- [ ] MainLayout with sidebar + header
- [ ] Sidebar navigation menu
- [ ] Header with user info + logout
- [ ] Footer component
- [ ] Responsive mobile menu

**Deliverable:** Working authentication + basic layout

---

### Phase 2: Core Booking System (Week 3-5)
**Goal:** Complete booking management functionality

#### 2.1 Dashboard
- [ ] Dashboard page with statistics cards
- [ ] Charts (bookings by month, revenue trends)
- [ ] Recent bookings table
- [ ] Quick stats (confirmed bookings, payments due)
- [ ] Connect to `/api/reports/dashboard-stats`

#### 2.2 Bookings List
- [ ] Bookings table with filters (status, date range, client)
- [ ] Search functionality
- [ ] Pagination
- [ ] Status badges (inquiry, quoted, confirmed, completed)
- [ ] Connect to `/api/bookings`

#### 2.3 Create Booking (Multi-Step Wizard)
- [ ] Step 1: Basic info (client, dates, pax count)
- [ ] Step 2: Add services (hotels, tours, transfers, flights)
- [ ] Step 3: Review and submit
- [ ] Auto-generate booking code (Funny-XXXX)
- [ ] Calculate totals automatically
- [ ] Connect to POST `/api/bookings`

#### 2.4 Booking Details View
- [ ] Display full booking information
- [ ] Show all services in tabs
- [ ] Display passengers
- [ ] Show payment status
- [ ] Display profitability
- [ ] Connect to `/api/bookings/:id`

#### 2.5 Booking Services Management
- [ ] Add/edit hotel bookings
- [ ] Add/edit tour bookings
- [ ] Add/edit transfer bookings
- [ ] Add/edit flight bookings
- [ ] Connect to booking services APIs

**Deliverable:** Full booking lifecycle management

---

### Phase 3: Inventory Management (Week 6-7)
**Goal:** Manage all master data (clients, hotels, suppliers, resources)

#### 3.1 Clients Management
- [ ] Clients list with search/filter
- [ ] Add/edit client form
- [ ] Client details view
- [ ] Agent vs Direct client toggle
- [ ] Commission rate tracking
- [ ] Connect to `/api/clients`

#### 3.2 Hotels Management
- [ ] Hotels list with search
- [ ] Add/edit hotel form
- [ ] Hotel details (city, country, contact)
- [ ] Standard cost tracking
- [ ] Connect to `/api/hotels`

#### 3.3 Tour Suppliers Management
- [ ] Tour suppliers list
- [ ] Add/edit supplier form
- [ ] Services offered tracking
- [ ] Connect to `/api/tour-suppliers`

#### 3.4 Guides Management
- [ ] Guides list with availability filter
- [ ] Add/edit guide form
- [ ] Languages and specialization
- [ ] Daily rate tracking
- [ ] Availability status management
- [ ] Connect to `/api/guides`

#### 3.5 Vehicles Management
- [ ] Vehicles list with availability filter
- [ ] Add/edit vehicle form
- [ ] Type, capacity, plate number
- [ ] Driver information
- [ ] Daily rate tracking
- [ ] Connect to `/api/vehicles`

**Deliverable:** Complete inventory management system

---

### Phase 4: Payment Tracking (Week 8-9)
**Goal:** Track all financial transactions

#### 4.1 Client Payments
- [ ] Client payments list
- [ ] Filter by booking/date/payment method
- [ ] Add payment form
- [ ] Payment history by booking
- [ ] Outstanding balance display
- [ ] Connect to `/api/client-payments`

#### 4.2 Supplier Payments
- [ ] Supplier payments list
- [ ] Add payment form
- [ ] Payment summary view
- [ ] Filter by supplier/date
- [ ] Outstanding payables
- [ ] Connect to `/api/supplier-payments`

#### 4.3 Payment Dashboard
- [ ] Total receivables vs payables
- [ ] Payment due calendar
- [ ] Recent transactions
- [ ] Payment method breakdown

**Deliverable:** Complete payment tracking system

---

### Phase 5: Financial System (Week 10-11)
**Goal:** Comprehensive financial reporting and expense management

#### 5.1 Operational Expenses
- [ ] Expenses list with filters
- [ ] Add/edit expense form
- [ ] Category-based grouping
- [ ] Recurring expense management
- [ ] Expense summary by category
- [ ] Connect to `/api/operational-expenses`

#### 5.2 Profit & Loss Report
- [ ] Monthly P&L view
- [ ] Revenue breakdown
- [ ] Cost breakdown
- [ ] Expense categories
- [ ] Net profit calculation
- [ ] Month selector
- [ ] Connect to `/api/reports/monthly-pl`

#### 5.3 Cash Flow Report
- [ ] Date range selector
- [ ] Cash inflows (client payments)
- [ ] Cash outflows (supplier payments + expenses)
- [ ] Net cash flow
- [ ] Connect to `/api/reports/cash-flow`

#### 5.4 Sales Reports
- [ ] Sales by client report
- [ ] Sales by service type report
- [ ] Top clients ranking
- [ ] Service type profitability
- [ ] Connect to `/api/reports/sales-by-client` and `/sales-by-service`

#### 5.5 Outstanding Report
- [ ] Outstanding receivables
- [ ] Outstanding payables
- [ ] Aging analysis
- [ ] Connect to `/api/reports/outstanding`

#### 5.6 Booking Profitability
- [ ] Per-booking profit analysis
- [ ] Cost vs revenue comparison
- [ ] Margin percentage
- [ ] Connect to `/api/reports/booking-profitability/:id`

**Deliverable:** Complete financial reporting system

---

### Phase 6: Vouchers & Polish (Week 12)
**Goal:** PDF voucher generation and final polish

#### 6.1 Voucher Generation
- [ ] Voucher generation page
- [ ] Select booking
- [ ] Preview voucher
- [ ] Download PDF
- [ ] Connect to voucher generation API
- [ ] Email voucher functionality

#### 6.2 User Management (Admin Only)
- [ ] Users list
- [ ] Add/edit user form
- [ ] Role management (admin, staff, accountant)
- [ ] Password reset
- [ ] Connect to `/api/users`

#### 6.3 Excel Export
- [ ] Export bookings to Excel
- [ ] Export clients to Excel
- [ ] Export payments to Excel
- [ ] Export reports to Excel
- [ ] Use ExcelJS library

#### 6.4 Responsive Design
- [ ] Mobile-optimized navigation
- [ ] Responsive tables
- [ ] Touch-friendly interactions
- [ ] Test on various screen sizes

#### 6.5 Final Polish
- [ ] Loading states for all API calls
- [ ] Error handling and user feedback
- [ ] Success notifications
- [ ] Confirmation dialogs
- [ ] Form validation messages
- [ ] Accessibility improvements
- [ ] Performance optimization

**Deliverable:** Production-ready application

---

## API Integration Summary

All 34 backend endpoints are operational and tested:

### Authentication (2 endpoints)
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Current user info

### Bookings (3 endpoints)
- GET `/api/bookings` - List bookings
- GET `/api/bookings/:id` - Booking details
- POST `/api/bookings` - Create booking

### Clients (2 endpoints)
- GET `/api/clients` - List clients
- GET `/api/clients/:id` - Client details

### Hotels (2 endpoints)
- GET `/api/hotels` - List hotels
- GET `/api/hotels/:id` - Hotel details

### Tour Suppliers (1 endpoint)
- GET `/api/tour-suppliers` - List suppliers

### Guides (2 endpoints)
- GET `/api/guides` - List guides
- GET `/api/guides?status=available` - Available guides

### Vehicles (2 endpoints)
- GET `/api/vehicles` - List vehicles
- GET `/api/vehicles?status=available` - Available vehicles

### Booking Services (4 endpoints)
- GET `/api/booking-hotels` - List booking hotels
- GET `/api/booking-tours` - List booking tours
- GET `/api/booking-transfers` - List booking transfers
- GET `/api/booking-flights` - List booking flights

### Payments (3 endpoints)
- GET `/api/client-payments` - List client payments
- GET `/api/supplier-payments` - List supplier payments
- GET `/api/supplier-payments/summary` - Payment summary

### Operational Expenses (2 endpoints)
- GET `/api/operational-expenses` - List expenses
- GET `/api/operational-expenses/summary?year=2025` - Expense summary

### Reports (7 endpoints)
- GET `/api/reports/dashboard-stats` - Dashboard statistics
- GET `/api/reports/monthly-pl?month=2025-11` - Monthly P&L
- GET `/api/reports/booking-profitability/:id` - Booking profit
- GET `/api/reports/cash-flow?from_date=X&to_date=Y` - Cash flow
- GET `/api/reports/sales-by-client` - Sales by client
- GET `/api/reports/sales-by-service` - Sales by service
- GET `/api/reports/outstanding` - Outstanding payments

### Users (1 endpoint)
- GET `/api/users` - List users (admin only)

### Vouchers (1 endpoint)
- GET `/api/vouchers` - List vouchers

### Health (1 endpoint)
- GET `/health` - System health check

---

## Key Features by Role

### Admin
- Full access to all features
- User management
- System configuration
- All reports and analytics

### Staff
- Create and manage bookings
- Client management
- Inventory management
- View reports (limited)

### Accountant
- Payment management
- Financial reports
- Expense tracking
- P&L and cash flow reports

---

## Technical Considerations

### State Management
- **Auth State:** React Context API
- **Form State:** Local component state + useForm hook
- **Server State:** React Query (optional) or custom useFetch hook

### API Communication
- Axios instance with base URL configuration
- Request interceptor for JWT token injection
- Response interceptor for error handling
- Automatic token refresh on 401 errors

### Form Validation
- Client-side validation using custom validators
- Server-side error display
- Real-time validation feedback

### Data Tables
- Sorting and filtering
- Pagination (client-side or server-side)
- Search functionality
- Export to Excel

### Charts & Visualization
- Chart.js or Recharts for data visualization
- Responsive charts
- Interactive tooltips

### Error Handling
- Global error boundary
- API error handling
- User-friendly error messages
- Retry logic for failed requests

### Performance
- Lazy loading for routes
- Image optimization
- Debounced search inputs
- Memoization for expensive calculations

### Security
- JWT token in localStorage (or httpOnly cookies)
- Automatic token refresh
- Protected routes
- Role-based access control
- Input sanitization

---

## Development Workflow

### 1. Component Development
1. Create component file
2. Build UI with Tailwind + shadcn/ui
3. Implement business logic
4. Connect to API service
5. Add error handling
6. Test component

### 2. Page Development
1. Create page component
2. Add to router
3. Implement layout
4. Add data fetching
5. Add forms and interactions
6. Test page flow

### 3. API Integration
1. Create service function
2. Define API endpoint
3. Handle request/response
4. Add error handling
5. Test with backend

### 4. Testing Checklist
- [ ] Component renders correctly
- [ ] API calls work as expected
- [ ] Error states display properly
- [ ] Loading states work
- [ ] Forms validate correctly
- [ ] Data displays correctly
- [ ] Responsive on mobile
- [ ] Role-based access works

---

## Environment Variables

```env
# Frontend .env file
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Funny Tourism Operations
VITE_APP_VERSION=1.0.0
```

---

## Success Criteria

### Functionality
- ✅ All 34 backend APIs integrated
- ✅ Complete CRUD operations for all entities
- ✅ Real-time calculations (totals, margins)
- ✅ PDF voucher generation
- ✅ Excel export functionality
- ✅ Role-based access control

### User Experience
- ✅ Fast page loads (<2 seconds)
- ✅ Responsive design (mobile + desktop)
- ✅ Intuitive navigation
- ✅ Clear error messages
- ✅ Loading indicators
- ✅ Success feedback

### Performance
- ✅ Lighthouse score >90
- ✅ First Contentful Paint <1.5s
- ✅ Time to Interactive <3s
- ✅ Optimized bundle size

### Security
- ✅ Secure authentication
- ✅ Protected routes
- ✅ No exposed secrets
- ✅ Input validation
- ✅ XSS protection

---

## Next Steps

1. **Initialize Vite + React project**
2. **Install and configure dependencies**
3. **Set up folder structure**
4. **Create authentication system**
5. **Build main layout**
6. **Start with Dashboard page**

---

**Last Updated:** 2025-11-07
**Status:** 🟢 Ready to Start
**Backend Status:** ✅ Complete (34/34 APIs tested and working)
**Next Task:** Initialize frontend project
