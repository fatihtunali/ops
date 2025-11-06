# Funny Tourism Operations - Custom Management System

## System Overview

Based on comprehensive research of industry-leading tour operator systems, this document outlines a custom solution tailored for Funny Tourism.

### Company Requirements
1. Clients: agents / direct clients
2. Direct hotel bookings
3. Tours: supplier-based OR self-operated (guide + vehicle + entrance fees)
4. Payment tracking across all accounts
5. Manual reservation tracking (incoming/outgoing)
6. Coding system: Funny-1046, 1047, 1048, etc.
7. Single unified system accessible in office
8. Replace Excel tracking
9. Automated voucher generation for all bookings
10. Real-time profitability tracking

### Scale
- **Users**: Maximum 5 concurrent
- **Volume**: ~100 requests/month with 30% confirmation rate (~30 bookings/month)
- **Infrastructure**: Existing cloud server + free domain
- **Priority**: Zero current follow-up system - starting from scratch

---

## Recommended Technology Stack

### Backend
- **Node.js + Express** - Fast, easy maintenance, great for small teams
- **PostgreSQL** - Handles complex relationships, reliable (using direct SQL queries, no ORM)
- **pg (node-postgres)** - PostgreSQL client for Node.js

### Frontend
- **React + Vite** - Modern, fast development
- **Tailwind CSS** - Quick styling
- **shadcn/ui components** - Professional UI out of the box

### Deployment
- Docker containerized on existing cloud server
- **Nginx** reverse proxy
- **PM2** process management
- **PostgreSQL** database

### Additional Tools
- **Puppeteer/PDFKit** - PDF voucher generation
- **Nodemailer** - Email automation
- **ExcelJS** - Report exports
- **JWT** - Authentication

---

## Database Schema

### Core Tables

#### Clients (Agents + Direct Clients)
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  client_code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'agent' or 'direct'
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  commission_rate DECIMAL(5,2), -- for agents only (e.g., 15.00 = 15%)
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);
```

#### Booking Requests (ALL inquiries)
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL, -- Funny-1046
  client_id INTEGER REFERENCES clients(id),
  pax_count INTEGER, -- number of passengers
  travel_date_from DATE,
  travel_date_to DATE,

  -- Status tracking
  status VARCHAR(30) NOT NULL, -- 'inquiry', 'quoted', 'confirmed', 'completed', 'cancelled'
  is_confirmed BOOLEAN DEFAULT FALSE, -- only TRUE bookings appear in finance

  -- Pricing (totals calculated from services)
  total_sell_price DECIMAL(12,2) DEFAULT 0,
  total_cost_price DECIMAL(12,2) DEFAULT 0,
  gross_profit DECIMAL(12,2) DEFAULT 0,

  -- Payment tracking
  payment_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
  amount_received DECIMAL(12,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT
);
```

#### Passengers
```sql
CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  passport_number VARCHAR(50),
  nationality VARCHAR(100),
  date_of_birth DATE,
  special_requests TEXT
);
```

#### Hotels Database
```sql
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  standard_cost_per_night DECIMAL(10,2), -- your typical cost
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active'
);
```

#### Tour Suppliers
```sql
CREATE TABLE tour_suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  services_offered TEXT,
  payment_terms TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active'
);
```

#### Guides Database (Self-Operated Tours)
```sql
CREATE TABLE guides (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  languages VARCHAR(255), -- comma-separated: English, Turkish, Arabic
  daily_rate DECIMAL(10,2),
  specialization VARCHAR(255), -- Historical, Adventure, Cultural, etc.
  availability_status VARCHAR(20) DEFAULT 'available',
  notes TEXT
);
```

#### Vehicles Database (Self-Operated Tours)
```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(50) NOT NULL,
  type VARCHAR(100), -- Sedan, Van, Bus, etc.
  capacity INTEGER,
  daily_rate DECIMAL(10,2),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'available',
  notes TEXT
);
```

### Booking Services Tables

#### Hotel Bookings
```sql
CREATE TABLE booking_hotels (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  hotel_id INTEGER REFERENCES hotels(id),
  hotel_name VARCHAR(255), -- stored for historical accuracy

  check_in DATE,
  check_out DATE,
  nights INTEGER,
  room_type VARCHAR(100),
  number_of_rooms INTEGER,

  -- Pricing
  cost_per_night DECIMAL(10,2),
  total_cost DECIMAL(10,2), -- cost * nights * rooms
  sell_price DECIMAL(10,2), -- what you charge client
  margin DECIMAL(10,2), -- sell_price - total_cost

  -- Supplier payment tracking
  payment_status VARCHAR(30) DEFAULT 'pending',
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_due_date DATE,

  confirmation_number VARCHAR(100),
  voucher_issued BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

#### Tour Bookings
```sql
CREATE TABLE booking_tours (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

  tour_name VARCHAR(255) NOT NULL,
  tour_date DATE,
  duration VARCHAR(50), -- "Full Day", "Half Day", "3 hours"
  pax_count INTEGER,

  -- Operation type
  operation_type VARCHAR(20) NOT NULL, -- 'supplier' or 'self-operated'

  -- If using supplier
  supplier_id INTEGER REFERENCES tour_suppliers(id),
  supplier_cost DECIMAL(10,2),

  -- If self-operated (breakdown costs)
  guide_id INTEGER REFERENCES guides(id),
  guide_cost DECIMAL(10,2) DEFAULT 0,

  vehicle_id INTEGER REFERENCES vehicles(id),
  vehicle_cost DECIMAL(10,2) DEFAULT 0,

  entrance_fees DECIMAL(10,2) DEFAULT 0,
  other_costs DECIMAL(10,2) DEFAULT 0,

  -- Total costing
  total_cost DECIMAL(10,2), -- supplier_cost OR (guide_cost + vehicle_cost + entrance_fees + other_costs)
  sell_price DECIMAL(10,2),
  margin DECIMAL(10,2),

  -- Payment tracking
  payment_status VARCHAR(30) DEFAULT 'pending',
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_due_date DATE,

  confirmation_number VARCHAR(100),
  voucher_issued BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

#### Transfer Bookings
```sql
CREATE TABLE booking_transfers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

  transfer_type VARCHAR(50), -- "Airport Pickup", "Airport Dropoff", "Inter-city"
  transfer_date DATE,
  from_location VARCHAR(255),
  to_location VARCHAR(255),
  pax_count INTEGER,

  vehicle_type VARCHAR(100),

  -- Supplier or self-operated
  operation_type VARCHAR(20) NOT NULL,
  supplier_id INTEGER REFERENCES tour_suppliers(id),
  vehicle_id INTEGER REFERENCES vehicles(id),

  cost_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  margin DECIMAL(10,2),

  payment_status VARCHAR(30) DEFAULT 'pending',
  paid_amount DECIMAL(10,2) DEFAULT 0,

  confirmation_number VARCHAR(100),
  voucher_issued BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

#### Flight Bookings
```sql
CREATE TABLE booking_flights (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

  airline VARCHAR(100),
  flight_number VARCHAR(50),
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  from_airport VARCHAR(100),
  to_airport VARCHAR(100),

  pax_count INTEGER,

  cost_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  margin DECIMAL(10,2),

  payment_status VARCHAR(30) DEFAULT 'pending',
  paid_amount DECIMAL(10,2) DEFAULT 0,

  pnr VARCHAR(50),
  ticket_numbers TEXT,
  voucher_issued BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

### Payment Tables

#### Client Payments (Money IN)
```sql
CREATE TABLE client_payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'credit_card', etc.

  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Supplier Payments (Money OUT)
```sql
CREATE TABLE supplier_payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),

  supplier_type VARCHAR(20) NOT NULL, -- 'hotel', 'tour', 'transfer', 'flight'
  supplier_id INTEGER, -- references hotels, tour_suppliers, etc.
  supplier_name VARCHAR(255),

  service_id INTEGER, -- references booking_hotels, booking_tours, etc.

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_date DATE,
  due_date DATE,
  payment_method VARCHAR(50),

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Operational Expenses
```sql
CREATE TABLE operational_expenses (
  id SERIAL PRIMARY KEY,

  expense_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'rent', 'salaries', 'utilities', 'marketing', etc.
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',

  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  is_recurring BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Vouchers
```sql
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),

  voucher_type VARCHAR(50), -- 'hotel', 'tour', 'transfer', 'flight'
  service_id INTEGER, -- references booking_hotels, booking_tours, etc.

  voucher_number VARCHAR(100) UNIQUE,
  issued_date TIMESTAMP DEFAULT NOW(),
  pdf_path VARCHAR(255), -- file path to generated PDF

  sent_to VARCHAR(255), -- email address where sent
  sent_at TIMESTAMP
);
```

#### Users (System Access)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(30) DEFAULT 'staff', -- 'admin', 'staff', 'accountant'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

---

## System Features

### 1. Dashboard (Landing Page)

```
┌─────────────────────────────────────────────────────┐
│  TODAY'S SNAPSHOT                                   │
├─────────────────────────────────────────────────────┤
│  📊 Active Inquiries: 12                            │
│  ✅ Confirmed Bookings (This Month): 8              │
│  💰 Revenue This Month: $24,500                     │
│  📈 Gross Profit This Month: $6,200                 │
│  ⚠️  Outstanding Payments from Clients: $3,200     │
│  ⚠️  Pending Supplier Payments: $1,800             │
├─────────────────────────────────────────────────────┤
│  UPCOMING DEPARTURES (Next 7 Days)                  │
│  • Funny-1046 - Istanbul Tour - Tomorrow            │
│  • Funny-1048 - Cappadocia Tour - Dec 10           │
└─────────────────────────────────────────────────────┘
```

**Key Metrics:**
- Active inquiries count
- Monthly confirmed bookings
- Monthly revenue and gross profit
- Outstanding receivables/payables
- Upcoming departures calendar

### 2. Booking Management

#### Create New Request
- Auto-generate booking code (Funny-1046, 1047, etc.)
- Select existing client or create new
- Add passenger details
- Initial status: "Inquiry"

#### Add Services to Booking

**Hotel Service:**
- Select hotel from database or enter manually
- Check-in, check-out dates (auto-calculates nights)
- Room type and number of rooms
- Enter cost price & sell price
- System calculates margin automatically

**Tour Service:**
- Choose operation type: "Supplier" or "Self-Operated"
- **If Supplier:**
  - Select supplier from database
  - Enter supplier cost
  - Enter sell price to client
  - System calculates margin

- **If Self-Operated:**
  - Select guide from database (auto-fills daily rate)
  - Select vehicle from database (auto-fills daily rate)
  - Enter entrance fees
  - Enter other costs
  - System calculates total cost automatically
  - Enter sell price
  - System shows margin

**Transfer Service:**
- Transfer type (Airport Pickup, Dropoff, Inter-city)
- From/to locations
- Choose supplier or self-operated (own vehicle)
- Enter costs and sell price

**Flight Service:**
- Airline, flight number, dates
- Airports, passenger count
- Cost and sell price

#### Real-time Calculations
- **Total sell price** = sum of all service sell prices
- **Total cost** = sum of all service costs
- **Gross profit** = Total sell - Total cost (displayed in real-time)

#### Status Progression
```
Inquiry → Quoted → Confirmed → Completed → Cancelled
```

**Important:** Only CONFIRMED bookings appear in financial reports

#### Booking List View
- Filter by status, date range, client
- Search by booking code or client name
- Sort by date, profit, status
- Quick status indicators
- Export to Excel

### 3. Payment Tracking

#### Client Payments (Money IN)
- Record payment against booking
- Track: Date, amount, payment method, reference number
- System automatically updates:
  - `amount_received` in booking
  - `payment_status` (pending → partial → paid)
- Shows outstanding balance clearly
- Payment history per booking

#### Supplier Payments (Money OUT)
- Each service automatically creates supplier payment record
- Track:
  - Due date
  - Payment date
  - Amount
  - Status (pending/paid)
- Filter view by:
  - Pending payments
  - Paid payments
  - Overdue payments
- Mark as paid when supplier is paid
- Payment history per supplier

#### Payment Dashboard
```
┌──────────────────────────────────────────┐
│  RECEIVABLES (Money to Collect)          │
├──────────────────────────────────────────┤
│  Funny-1046 | Client ABC | $500 overdue  │
│  Funny-1049 | Client XYZ | $1200 due     │
│                                          │
│  PAYABLES (Money to Pay)                │
├──────────────────────────────────────────┤
│  Hotel Marriott | Funny-1046 | $800 due  │
│  Guide Ali | Funny-1047 | $100 overdue   │
└──────────────────────────────────────────┘
```

### 4. Financial Reports

#### Monthly P&L Statement
```
PROFIT & LOSS - November 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVENUE
  Total Bookings Revenue        $24,500
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECT COSTS
  Hotel Costs                    $12,000
  Tour Costs                      $4,200
  Transfer Costs                  $1,100
  Flight Costs                    $1,000
  ─────────────────────────────
  Total Direct Costs             $18,300
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GROSS PROFIT                      $6,200
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPERATIONAL EXPENSES
  Office Rent                     $1,500
  Salaries                        $3,000
  Utilities                         $200
  Marketing                         $300
  Other                             $100
  ─────────────────────────────
  Total Operational Expenses      $5,100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NET PROFIT                        $1,100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**This report clearly shows if you're making money or not!**

#### Per-Booking Profitability
```
Booking: Funny-1046
Services:
  Hotel Hilton       Cost: $800   Sell: $1000  Margin: $200
  Cappadocia Tour    Cost: $300   Sell: $450   Margin: $150
  Airport Transfer   Cost: $50    Sell: $80    Margin: $30
  ────────────────────────────────────────────────────
  TOTAL             Cost: $1150   Sell: $1530  Margin: $380
```

#### Additional Financial Reports
- **Sales by Client** - Which agents/clients are most profitable
- **Sales by Service Type** - Hotels vs tours vs transfers performance
- **Outstanding Receivables** - Aging report (30/60/90 days)
- **Cash Flow Report** - Money in vs money out by date
- **Monthly Comparison** - Compare current month vs previous months
- **Yearly Summary** - Annual revenue, costs, profit trends

### 5. Voucher Generation

#### Auto-Generate Professional PDFs

**Workflow:**
```
When booking status = "Confirmed":
  → Button: "Generate Vouchers"
  → System creates PDF vouchers for:
     • Hotel Voucher
     • Tour Voucher
     • Transfer Voucher
     • Flight Voucher (if applicable)
  → Stores PDF files in database
  → Downloadable individually or as ZIP
  → Email directly to suppliers/clients
```

#### Hotel Voucher Template
```
┌─────────────────────────────────────────┐
│  FUNNY TOURISM LOGO                     │
│  HOTEL VOUCHER                          │
├─────────────────────────────────────────┤
│  Booking Reference: Funny-1046          │
│  Voucher Number: V-1046-H1              │
│                                         │
│  GUEST DETAILS                          │
│  Name: John Doe                         │
│  Check-in: 10 Dec 2025                  │
│  Check-out: 12 Dec 2025                 │
│  Nights: 2                              │
│  Room Type: Deluxe Double               │
│                                         │
│  HOTEL DETAILS                          │
│  Hotel: Hilton Istanbul                 │
│  Address: [Hotel Address]               │
│  Phone: [Hotel Phone]                   │
│  Confirmation: #ABC123                  │
│                                         │
│  Special Requests: Late check-in        │
│                                         │
│  Terms & Conditions:                    │
│  [Your standard terms]                  │
└─────────────────────────────────────────┘
```

#### Tour Voucher Template
```
┌─────────────────────────────────────────┐
│  FUNNY TOURISM LOGO                     │
│  TOUR VOUCHER                           │
├─────────────────────────────────────────┤
│  Booking Reference: Funny-1046          │
│  Voucher Number: V-1046-T1              │
│                                         │
│  GUEST DETAILS                          │
│  Name: John Doe                         │
│  Pax Count: 2 persons                   │
│  Tour Date: 11 Dec 2025                 │
│                                         │
│  TOUR DETAILS                           │
│  Tour: Cappadocia Hot Air Balloon       │
│  Duration: Full Day                     │
│  Pickup Time: 05:00 AM                  │
│  Pickup Location: Hotel Lobby           │
│                                         │
│  Guide: Ali Yilmaz                      │
│  Guide Phone: +90 555 123 4567          │
│  Vehicle: Mercedes Vito (Plate: 34ABC)  │
│                                         │
│  Inclusions:                            │
│  • Hot air balloon flight               │
│  • Breakfast                            │
│  • Entrance fees                        │
│  • Professional guide                   │
│                                         │
│  Terms & Conditions:                    │
│  [Your standard terms]                  │
└─────────────────────────────────────────┘
```

### 6. Resource Management

#### Guides
- Complete database of all guides
- Track:
  - Name, phone, email
  - Languages spoken (English, Turkish, Arabic, etc.)
  - Specialization (Historical, Adventure, Cultural)
  - Daily rate
  - Availability status
- Assignment history
- Performance notes

#### Vehicles
- Vehicle registry
- Track:
  - Vehicle number/plate
  - Type (Sedan, Van, Bus)
  - Capacity
  - Driver name and phone
  - Daily rate
  - Status (available/in use/maintenance)
- Booking schedule calendar
- Maintenance tracking

#### Resource Assignment
When creating self-operated tour:
- System shows available guides for selected date
- System shows available vehicles for selected date
- One-click assignment
- Auto-calculates costs based on daily rates
- Prevents double-booking

### 7. Client & Supplier Management

#### Client Database
Features:
- All agents and direct clients in one place
- Store commission rates for agents
- Contact information (email, phone, address)
- Contact history and notes
- Performance metrics:
  - Total bookings
  - Total revenue generated
  - Average booking value
  - Payment reliability score
- Quick filter: agents vs direct clients
- Export client list

#### Supplier Database

**Hotels:**
- Hotel details (name, location, contact)
- Standard cost rates
- Payment terms
- Historical booking data
- Performance notes

**Tour Suppliers:**
- Company details
- Services offered
- Payment terms
- Reliability rating
- Historical performance

**Transfer Companies:**
- Fleet information
- Coverage areas
- Pricing
- Service quality notes

---

## Workflow Examples

### Example 1: Creating a New Booking (Inquiry to Confirmation)

**Step 1: New Inquiry Received**
1. Click "New Booking"
2. System auto-generates: Funny-1047
3. Select client: "ABC Travel Agency"
4. Add passengers: John Doe, Jane Doe
5. Travel dates: Dec 10-15, 2025
6. Status: "Inquiry"
7. Save

**Step 2: Add Services**
1. Click "Add Hotel"
   - Select: Hilton Istanbul
   - Check-in: Dec 10, Check-out: Dec 12 (2 nights)
   - Room type: Deluxe Double, Qty: 1
   - Cost per night: $150 → Total cost: $300
   - Sell price: $400
   - **Margin: $100** (auto-calculated, shown in green)

2. Click "Add Tour"
   - Select: "Self-Operated"
   - Tour name: Cappadocia Hot Air Balloon
   - Date: Dec 11, 2025
   - Select guide: Ali Yilmaz (daily rate: $80) ✓
   - Select vehicle: Mercedes Vito (daily rate: $120) ✓
   - Entrance fees: $50
   - Other costs: $30
   - **Total cost: $280** (auto-calculated)
   - Sell price: $450
   - **Margin: $170** (auto-calculated, shown in green)

3. Click "Add Transfer"
   - Transfer: Airport Pickup
   - Date: Dec 10, 2025
   - Operation: Self-Operated
   - Select vehicle: Toyota Sedan
   - Cost: $30
   - Sell price: $50
   - **Margin: $20** (auto-calculated)

**Booking Summary (Auto-calculated):**
```
Total Sell Price: $900
Total Cost: $610
Gross Profit: $290 ✓
```

**Step 3: Send Quotation**
1. Update status to "Quoted"
2. Generate PDF quotation
3. Send to client via email

**Step 4: Client Confirms**
1. Update status to "Confirmed"
2. `is_confirmed` = TRUE (now appears in financial reports)
3. Confirm with suppliers (hotel, etc.)
4. Enter confirmation numbers

**Step 5: Generate Vouchers**
1. Click "Generate Vouchers"
2. System creates:
   - Hotel voucher (V-1047-H1)
   - Tour voucher (V-1047-T1)
   - Transfer voucher (V-1047-TR1)
3. Download and email to suppliers/client

**Step 6: Payment Tracking**
1. Client pays deposit: $450 (50%)
   - Click "Add Payment"
   - Date: Dec 1
   - Amount: $450
   - Method: Bank Transfer
   - Reference: TXN12345
   - System updates: Payment Status = "Partial"

2. Client pays balance: $450
   - Add second payment
   - System updates: Payment Status = "Paid" ✓

3. Pay suppliers:
   - Hotel Hilton: Mark $300 as paid (Dec 5)
   - Guide Ali: Mark $80 as paid (Dec 11)
   - Vehicle rental: Mark $120 as paid (Dec 11)
   - Entrance fees: Mark $50 as paid (Dec 11)
   - Other: Mark $30 as paid (Dec 11)

**Step 7: Completion**
1. After tour completes: Update status to "Completed"
2. Booking now contributes to monthly P&L
3. Client and supplier payments fully reconciled

---

### Example 2: Monthly Financial Review

**Accountant logs in on last day of month:**

1. **Dashboard Overview:**
   - Total bookings this month: 28 confirmed
   - Total revenue: $42,000
   - Gross profit: $10,500

2. **Click "Monthly P&L Report":**
   ```
   NOVEMBER 2025 P&L
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   Revenue                $42,000
   Direct Costs           $31,500
   ─────────────────────────
   Gross Profit           $10,500

   Operational Expenses:
     Rent                  $2,000
     Salaries              $5,000
     Utilities               $300
     Marketing               $500
     Other                   $200
   ─────────────────────────
   Total OpEx             $8,000

   NET PROFIT             $2,500 ✓
   ```

3. **Check Outstanding Payments:**
   - Receivables: $3,200 pending from 3 clients
   - Payables: $1,800 pending to 2 suppliers
   - Net outstanding: +$1,400

4. **Export to Excel:**
   - Click "Export Monthly Report"
   - Share with management

**Result: Clear understanding if company is profitable!**

---

## Implementation Roadmap (12 Weeks)

### Phase 1: Foundation (Weeks 1-2)

**Week 1: Environment Setup**
- Set up development environment (Node.js, PostgreSQL)
- Create database schema (all tables)
- Initialize project structure:
  - Backend: Express.js API
  - Frontend: React + Vite
- Set up version control (Git)
- Configure Docker for deployment
- Basic authentication system (login/logout)

**Week 2: Core Infrastructure**
- Build API endpoints for authentication
- Create database migrations
- Build basic UI layout and navigation
- Create dashboard skeleton
- Implement client management (CRUD operations)
- Test deployment on cloud server
- Set up automated backups

**Deliverables:**
- Working login system
- Client management module
- Deployed to cloud server
- Database backed up

---

### Phase 2: Core Booking System (Weeks 3-5)

**Week 3: Booking Foundation**
- Booking creation form
- Auto-generate booking codes (Funny-XXXX)
- Add passengers to booking
- Basic booking list view with filters
- Search functionality
- Status management

**Week 4: Service Management**
- Add hotel service to booking
  - Date selection, room types
  - Cost and sell price entry
  - Margin calculation
- Add tour service
  - Supplier option
  - Self-operated option with resource assignment
  - Cost breakdown
- Add transfer service
- Add flight service
- Real-time pricing calculations across all services
- Total booking value calculation

**Week 5: Booking Workflow**
- Booking status workflow (Inquiry → Quoted → Confirmed → Completed)
- Edit and update bookings
- Booking detail view (all services displayed)
- Confirmation number tracking
- Notes and special requests
- Booking duplication (copy existing booking)

**Deliverables:**
- Complete booking creation and management
- All service types supported
- Real-time profit calculations
- Status progression workflow

---

### Phase 3: Inventory Management (Weeks 6-7)

**Week 6: Supplier Management**
- Hotels database CRUD
  - Hotel details, contacts
  - Standard rates
- Tour suppliers database CRUD
  - Company details
  - Services offered
- Transfer suppliers database
- Import existing data from Excel

**Week 7: Resource Management**
- Guides database CRUD
  - Personal details
  - Languages, specialization
  - Daily rates
  - Availability status
- Vehicles database CRUD
  - Vehicle details
  - Driver information
  - Daily rates
- Resource assignment to tours
- Basic availability checking (prevent double-booking)
- Resource calendar view

**Deliverables:**
- Complete supplier and resource databases
- Assignment system for self-operated tours
- Data migrated from Excel

---

### Phase 4: Payment Tracking (Weeks 8-9)

**Week 8: Client Payments**
- Client payment recording interface
- Payment history per booking
- Payment status tracking (pending/partial/paid)
- Outstanding balance calculation
- Payment method tracking
- Payment receipt generation (optional PDF)

**Week 9: Supplier Payments**
- Supplier payment tracking
- Payables management interface
- Payment due date tracking
- Overdue payment alerts
- Mark payments as paid
- Payment filters (pending/paid/overdue)
- Supplier payment history

**Deliverables:**
- Complete payment tracking for clients and suppliers
- Outstanding payment dashboard
- Payment alerts system

---

### Phase 5: Financial System (Weeks 10-11)

**Week 10: Expenses & P&L**
- Operational expenses module
  - Add expenses by category
  - Recurring expense support
  - Monthly expense tracking
- Monthly P&L report
  - Revenue calculation (confirmed bookings only)
  - Direct costs breakdown
  - Operational expenses
  - Net profit calculation
- Per-booking profitability view
- Month-over-month comparison

**Week 11: Financial Reports & Dashboard**
- Cash flow reports
- Outstanding receivables report (aging)
- Outstanding payables report
- Sales by client report
- Sales by service type report
- Export all reports to Excel
- Dashboard metrics and charts
  - Revenue trends
  - Booking volume trends
  - Top clients
  - Profitability trends

**Deliverables:**
- Complete financial reporting system
- Answer the key question: "Are we making money?"
- Excel export functionality
- Visual dashboard with charts

---

### Phase 6: Vouchers & Polish (Week 12)

**Week 12: Final Features**
- PDF voucher generation
  - Hotel vouchers
  - Tour vouchers
  - Transfer vouchers
  - Flight vouchers
- Email integration
  - Send vouchers automatically
  - Payment reminders
  - Booking confirmations
- Final UI/UX improvements
  - Mobile responsiveness
  - Loading states
  - Error handling
- User acceptance testing
- Training documentation
- Video tutorials for staff
- Handover and go-live

**Deliverables:**
- Complete system ready for production
- All voucher types working
- Email automation
- Training materials
- System live and staff trained

---

## Post-Launch (Ongoing)

### Month 1-3: Stabilization
- Monitor system performance
- Fix any bugs discovered
- Gather user feedback
- Make minor UI adjustments
- Optimize slow queries

### Month 4-6: Enhancements
Based on usage, consider:
- Mobile app (React Native)
- WhatsApp integration for client communication
- SMS reminders for upcoming tours
- Advanced reporting (more chart types)
- Supplier portal (suppliers can log in and see their bookings)

### Month 7-12: Advanced Features
- API integrations with hotel booking systems
- Automated pricing suggestions based on historical data
- Customer portal (clients can log in and see their bookings)
- Marketing automation
- Advanced analytics (predictive revenue, seasonal trends)

---

## Key Success Metrics

### Operational Metrics
- Time to create booking: < 5 minutes (vs Excel: 20+ minutes)
- Time to generate vouchers: < 30 seconds (vs Excel: hours)
- Payment tracking accuracy: 100%
- Double-booking incidents: 0

### Financial Metrics
- Real-time profitability visibility: Yes ✓
- Monthly P&L generation time: < 1 minute (vs Excel: days)
- Outstanding payment visibility: Real-time
- Financial decision-making speed: Immediate

### Business Impact
- Reduce manual data entry time: 80%
- Eliminate Excel version control issues: 100%
- Improve booking confirmation speed: 60%
- Increase booking volume capacity: 3x (from ~30 to 90+ bookings/month)
- Staff time saved per week: 15-20 hours

---

## Security & Data Protection

### Access Control
- Role-based access control (RBAC)
  - Admin: Full access
  - Staff: Create/edit bookings, view reports
  - Accountant: Payment tracking, financial reports only
- Individual user accounts with unique credentials
- Password requirements (minimum 8 chars, mixed case, numbers)
- Session timeout after 30 minutes of inactivity

### Data Security
- All passwords hashed with bcrypt
- HTTPS/SSL encryption for all connections
- Database connection encrypted
- Regular automated backups (daily)
- Backup retention: 30 days
- Sensitive data (passport numbers) encrypted at rest

### Audit Trail
- Log all critical actions:
  - Booking creation/modification
  - Payment recording
  - Status changes
  - User login/logout
- Immutable audit logs
- Who, what, when for compliance

### Data Backup Strategy
- Automated daily database backups
- Weekly full system backups
- Off-site backup storage
- Tested restore procedures (monthly)
- Disaster recovery plan

---

## Training & Documentation

### User Documentation
- Quick start guide (PDF)
- Feature-by-feature tutorials
- Common workflows documented
- FAQ section
- Troubleshooting guide

### Video Tutorials
- System overview (5 mins)
- Creating a booking (10 mins)
- Payment tracking (8 mins)
- Generating reports (7 mins)
- Voucher generation (5 mins)

### Support
- In-app help tooltips
- Email support during first 3 months
- Remote assistance available
- Knowledge base with searchable articles

---

## Cost Estimation

### Development Costs
- Custom development: Provided by me (Claude Code) ✓
- No licensing fees
- No per-user fees

### Infrastructure Costs (Monthly)
- Cloud server: You already have ✓
- Domain: You already have ✓
- Database: Included on your server ✓
- Email service: ~$10/month (SendGrid/Mailgun)
- SSL Certificate: Free (Let's Encrypt)

**Total Monthly Operating Cost: ~$10**

### Comparison to Commercial Solutions
- Tourplan: $200-500/month
- Rezdy: $99-299/month
- TrekkSoft: $149-399/month
- Dolphin Dynamics: $400-800/month

**Savings: $100-800/month = $1,200-9,600/year**

---

## Technology Advantages

### Why This Stack?

**Node.js + Express:**
- Fast development
- Large community support
- Easy to maintain
- Excellent for APIs
- Non-blocking I/O (handles concurrent users well)

**PostgreSQL:**
- Most advanced open-source database
- Handles complex relationships
- ACID compliant (data integrity)
- JSON support for flexible data
- Excellent reporting performance

**React:**
- Modern, component-based UI
- Fast rendering
- Large ecosystem
- Easy to learn
- Mobile-ready (can create app later)

**Docker:**
- Easy deployment
- Consistent environments
- Quick updates
- Easy rollbacks if issues occur
- Portable (move to any server)

---

## Next Steps

### Immediate Action Items

1. **Confirm Requirements**
   - Review this document
   - Confirm all features needed
   - Identify any missing requirements
   - Prioritize "must-have" vs "nice-to-have"

2. **Prepare Data**
   - Export existing Excel data
   - List of all clients
   - List of all suppliers (hotels, guides, vehicles)
   - Historical bookings (if needed)

3. **Server Setup**
   - Confirm server access
   - Install required software (Docker, PostgreSQL)
   - Set up domain DNS
   - Configure SSL certificate

4. **Begin Development**
   - Start with Phase 1 (Weeks 1-2)
   - Weekly progress reviews
   - Iterative testing with real data
   - Staff feedback incorporation

### Ready to Start?

Confirm you're ready to proceed and I'll begin building:
1. Project initialization
2. Database setup
3. Basic authentication
4. First working prototype

**Expected time to first working version: 2-3 days**
**Expected time to production-ready system: 12 weeks**

---

## Appendix: Industry Research Summary

### Key Findings from Tour Operator Systems Analysis

#### Common Features Across Leading Platforms
1. **Multi-type booking support**: FIT, group bookings, MICE, series tours
2. **Real-time availability management**: Prevent overbooking
3. **Supplier connectivity**: API integrations with GDS (Amadeus, Sabre, Travelport)
4. **Dynamic pricing**: Seasonal rates, markup calculations
5. **Payment schedules**: Deposit, installments, final payment workflows
6. **Automated documentation**: Vouchers, confirmations, itineraries
7. **Multi-currency support**: Forex management
8. **Resource management**: Guides, vehicles, equipment tracking

#### Best Practices Adopted
1. **Separation of concerns**: Service catalog separate from bookings
2. **State machine for bookings**: Clear status progression
3. **Idempotency**: Prevent duplicate charges
4. **Audit trails**: Track all changes
5. **Soft deletes**: Never hard delete bookings
6. **Multi-currency handling**: Store original + base currency
7. **Commission tracking**: Calculate at booking time
8. **Real-time synchronization**: Update availability instantly

#### Technical Architecture Lessons
1. **Microservices preferred** for scalability (can implement later)
2. **Event-driven architecture** for async operations
3. **Pessimistic locking** for high-demand inventory
4. **API-first design** for future integrations
5. **Cloud-native deployment** for reliability
6. **PostgreSQL + Redis** optimal for tour operators
7. **React/Vue frontend** for modern UX

#### Pricing Strategies Observed
- **Cost-plus pricing**: Add fixed markup percentage
- **Net vs gross rates**: Industry standard
- **Typical margins**: 10-40% depending on service type
- **Early bird discounts**: 15-20% for advance bookings
- **Group discounts**: Tiered based on pax count

#### KPIs Tracked by Successful Operators
- Conversion rate (inquiry to booking): Target 30-40%
- Average booking value: Track and increase
- Revenue per booking: Monitor trends
- Customer acquisition cost (CAC): Keep below 10% of booking value
- Repeat customer rate: Target 20-30%
- Supplier payment accuracy: 100%
- On-time departure rate: 99%+

---

## Contact & Support

For questions, issues, or feature requests during development:
- Document all requests in project management system
- Weekly progress meetings
- Immediate support for critical issues
- Training sessions before go-live

---

**Document Version:** 1.0
**Last Updated:** December 2025
**Prepared For:** Funny Tourism Operations
**Prepared By:** Claude Code (Anthropic)

---

## Quick Reference: Status Values

### Booking Status
- `inquiry` - Initial request, not yet quoted
- `quoted` - Quotation sent to client
- `confirmed` - Client accepted, appears in financials
- `completed` - Tour finished, ready for final reconciliation
- `cancelled` - Booking cancelled

### Payment Status
- `pending` - No payment received
- `partial` - Some payment received
- `paid` - Fully paid

### Resource Status
- `available` - Ready to be assigned
- `in_use` - Currently assigned to booking
- `maintenance` - Not available
- `inactive` - Removed from active roster

---

## Quick Reference: User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features, user management, system settings |
| **Staff** | Create/edit bookings, view reports, manage suppliers, cannot delete financial records |
| **Accountant** | Payment tracking, financial reports, expense management, cannot modify bookings |

---

## Emergency Procedures

### System Down
1. Check cloud server status
2. Restart Docker containers
3. Check database connectivity
4. Review error logs
5. Contact support if unresolved in 30 minutes

### Data Recovery
1. Stop all write operations
2. Restore from most recent backup
3. Verify data integrity
4. Resume operations
5. Document incident

### Payment Discrepancy
1. Check audit logs
2. Review payment history
3. Cross-reference with bank statements
4. Update system if needed
5. Document resolution

---

**END OF DOCUMENT**

*This comprehensive plan ensures Funny Tourism can manage all operations efficiently, track profitability in real-time, and scale operations as the business grows.*
