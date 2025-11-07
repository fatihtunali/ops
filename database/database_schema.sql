-- ============================================================
-- FUNNY TOURISM OPERATIONS - DATABASE SCHEMA
-- ============================================================
-- Version: 1.0
-- Last Updated: 2025-12-06
-- Database: PostgreSQL 12+
--
-- IMPORTANT: This is the source of truth for database structure
-- Always check and update this file before making any database changes
-- ============================================================

-- ============================================================
-- SECTION 1: USER MANAGEMENT
-- ============================================================

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

-- Index for faster login queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SECTION 2: CLIENT MANAGEMENT
-- ============================================================

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
    status VARCHAR(20) DEFAULT 'active',

    CONSTRAINT chk_client_type CHECK (type IN ('agent', 'direct'))
);

-- Indexes for faster searches
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(name);

-- ============================================================
-- SECTION 3: SUPPLIER & RESOURCE MANAGEMENT
-- ============================================================

-- Hotels Database
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_hotel_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_status ON hotels(status);

-- Hotel Seasonal Rates (supports multiple pricing periods per hotel)
CREATE TABLE hotel_seasonal_rates (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,

    -- Season/Period information
    season_name VARCHAR(100) NOT NULL, -- e.g., "Summer 2025", "High Season", "Christmas Period"
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,

    -- Pricing structure
    price_per_person_double DECIMAL(10,2), -- per person in double room
    price_single_supplement DECIMAL(10,2), -- supplement for single occupancy
    price_per_person_triple DECIMAL(10,2), -- per person in triple room
    price_child_0_2 DECIMAL(10,2), -- child 0-2.99 years with 2 adults
    price_child_3_5 DECIMAL(10,2), -- child 3-5.99 years with 2 adults
    price_child_6_11 DECIMAL(10,2), -- child 6-11.99 years with 2 adults

    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_valid_date_range CHECK (valid_from <= valid_to),
    CONSTRAINT chk_positive_prices CHECK (
        price_per_person_double >= 0 AND
        price_single_supplement >= 0 AND
        price_per_person_triple >= 0 AND
        price_child_0_2 >= 0 AND
        price_child_3_5 >= 0 AND
        price_child_6_11 >= 0
    )
);

CREATE INDEX idx_hotel_seasonal_rates_hotel ON hotel_seasonal_rates(hotel_id);
CREATE INDEX idx_hotel_seasonal_rates_dates ON hotel_seasonal_rates(valid_from, valid_to);
CREATE INDEX idx_hotel_seasonal_rates_period ON hotel_seasonal_rates(hotel_id, valid_from, valid_to);

-- Tour Suppliers
CREATE TABLE tour_suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    services_offered TEXT,
    payment_terms TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_tour_supplier_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_tour_suppliers_status ON tour_suppliers(status);

-- Guides Database (for self-operated tours)
CREATE TABLE guides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    languages VARCHAR(255), -- comma-separated: English, Turkish, Arabic
    daily_rate DECIMAL(10,2),
    specialization VARCHAR(255), -- Historical, Adventure, Cultural, etc.
    availability_status VARCHAR(20) DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_guide_availability CHECK (availability_status IN ('available', 'busy', 'inactive'))
);

CREATE INDEX idx_guides_availability ON guides(availability_status);

-- Vehicles Database (for self-operated tours)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100), -- Sedan, Van, Bus, etc.
    capacity INTEGER,
    daily_rate DECIMAL(10,2),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_vehicle_status CHECK (status IN ('available', 'in_use', 'maintenance', 'inactive'))
);

CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ============================================================
-- SECTION 4: BOOKING MANAGEMENT
-- ============================================================

-- Main Bookings Table (ALL inquiries and confirmed bookings)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL, -- Funny-1046
    client_id INTEGER REFERENCES clients(id),
    pax_count INTEGER, -- number of passengers
    travel_date_from DATE,
    travel_date_to DATE,

    -- Status tracking
    status VARCHAR(30) NOT NULL DEFAULT 'inquiry',
    is_confirmed BOOLEAN DEFAULT FALSE, -- only TRUE bookings appear in finance

    -- Pricing (totals calculated from services)
    total_sell_price DECIMAL(12,2) DEFAULT 0,
    total_cost_price DECIMAL(12,2) DEFAULT 0,
    gross_profit DECIMAL(12,2) DEFAULT 0,

    -- Payment tracking
    payment_status VARCHAR(30) DEFAULT 'pending',
    amount_received DECIMAL(12,2) DEFAULT 0,

    -- Traveler information (for agent bookings)
    traveler_name VARCHAR(255),
    traveler_email VARCHAR(255),
    traveler_phone VARCHAR(50),
    booked_by VARCHAR(20) DEFAULT 'direct', -- 'agent' or 'direct'

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,

    CONSTRAINT chk_booking_status CHECK (status IN ('inquiry', 'quoted', 'confirmed', 'completed', 'cancelled')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'partial', 'paid')),
    CONSTRAINT chk_booked_by CHECK (booked_by IN ('agent', 'direct'))
);

-- Indexes for faster queries
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_is_confirmed ON bookings(is_confirmed);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date_from);
CREATE INDEX idx_bookings_booked_by ON bookings(booked_by);

-- Passengers (people traveling in a booking)
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    passport_number VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    special_requests TEXT
);

CREATE INDEX idx_passengers_booking ON passengers(booking_id);

-- ============================================================
-- SECTION 5: BOOKING SERVICES (Hotels, Tours, Transfers, Flights)
-- ============================================================

-- Hotel Bookings (services within a booking)
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_hotel_payment_status CHECK (payment_status IN ('pending', 'paid'))
);

CREATE INDEX idx_booking_hotels_booking ON booking_hotels(booking_id);
CREATE INDEX idx_booking_hotels_checkin ON booking_hotels(check_in);
CREATE INDEX idx_booking_hotels_payment ON booking_hotels(payment_status);

-- Tour Bookings (services within a booking)
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_tour_operation_type CHECK (operation_type IN ('supplier', 'self-operated')),
    CONSTRAINT chk_tour_payment_status CHECK (payment_status IN ('pending', 'paid'))
);

CREATE INDEX idx_booking_tours_booking ON booking_tours(booking_id);
CREATE INDEX idx_booking_tours_date ON booking_tours(tour_date);
CREATE INDEX idx_booking_tours_operation ON booking_tours(operation_type);
CREATE INDEX idx_booking_tours_payment ON booking_tours(payment_status);

-- Transfer Bookings (services within a booking)
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_transfer_operation_type CHECK (operation_type IN ('supplier', 'self-operated')),
    CONSTRAINT chk_transfer_payment_status CHECK (payment_status IN ('pending', 'paid'))
);

CREATE INDEX idx_booking_transfers_booking ON booking_transfers(booking_id);
CREATE INDEX idx_booking_transfers_date ON booking_transfers(transfer_date);
CREATE INDEX idx_booking_transfers_payment ON booking_transfers(payment_status);

-- Flight Bookings (services within a booking)
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_flight_payment_status CHECK (payment_status IN ('pending', 'paid'))
);

CREATE INDEX idx_booking_flights_booking ON booking_flights(booking_id);
CREATE INDEX idx_booking_flights_departure ON booking_flights(departure_date);
CREATE INDEX idx_booking_flights_payment ON booking_flights(payment_status);

-- ============================================================
-- SECTION 6: PAYMENT TRACKING
-- ============================================================

-- Client Payments (Money IN from clients)
CREATE TABLE client_payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'credit_card', etc.

    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

CREATE INDEX idx_client_payments_booking ON client_payments(booking_id);
CREATE INDEX idx_client_payments_date ON client_payments(payment_date);

-- Supplier Payments (Money OUT to suppliers)
CREATE TABLE supplier_payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),

    supplier_type VARCHAR(20) NOT NULL, -- 'hotel', 'tour', 'transfer', 'flight'
    supplier_id INTEGER, -- references hotels, tour_suppliers, etc.
    supplier_name VARCHAR(255),

    service_id INTEGER, -- references booking_hotels, booking_tours, etc.

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_date DATE,
    due_date DATE,
    payment_method VARCHAR(50),

    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_supplier_payment_status CHECK (status IN ('pending', 'paid')),
    CONSTRAINT chk_supplier_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_supplier_type CHECK (supplier_type IN ('hotel', 'tour', 'transfer', 'flight', 'guide', 'vehicle', 'other'))
);

CREATE INDEX idx_supplier_payments_booking ON supplier_payments(booking_id);
CREATE INDEX idx_supplier_payments_status ON supplier_payments(status);
CREATE INDEX idx_supplier_payments_due_date ON supplier_payments(due_date);

-- ============================================================
-- SECTION 7: OPERATIONAL EXPENSES
-- ============================================================

-- Operational Expenses (office rent, salaries, bills, etc.)
CREATE TABLE operational_expenses (
    id SERIAL PRIMARY KEY,

    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'rent', 'salaries', 'utilities', 'marketing', etc.
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',

    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_expense_amount CHECK (amount > 0)
);

CREATE INDEX idx_operational_expenses_date ON operational_expenses(expense_date);
CREATE INDEX idx_operational_expenses_category ON operational_expenses(category);

-- ============================================================
-- SECTION 8: VOUCHERS & DOCUMENTS
-- ============================================================

-- Vouchers (generated documents)
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),

    voucher_type VARCHAR(50), -- 'hotel', 'tour', 'transfer', 'flight'
    service_id INTEGER, -- references booking_hotels, booking_tours, etc.

    voucher_number VARCHAR(100) UNIQUE,
    issued_date TIMESTAMP DEFAULT NOW(),
    pdf_path VARCHAR(255), -- file path to generated PDF

    sent_to VARCHAR(255), -- email address where sent
    sent_at TIMESTAMP,

    CONSTRAINT chk_voucher_type CHECK (voucher_type IN ('hotel', 'tour', 'transfer', 'flight'))
);

CREATE INDEX idx_vouchers_booking ON vouchers(booking_id);
CREATE INDEX idx_vouchers_number ON vouchers(voucher_number);

-- ============================================================
-- SECTION 9: AUDIT & LOGGING
-- ============================================================

-- Audit Log (track all important changes)
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB, -- store old values as JSON
    new_values JSONB, -- store new values as JSON
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- SECTION 10: SEQUENCES & FUNCTIONS
-- ============================================================

-- Function to auto-generate booking codes (Funny-1046, Funny-1047, etc.)
CREATE SEQUENCE booking_code_seq START WITH 1046;

CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    new_code VARCHAR(50);
BEGIN
    next_number := nextval('booking_code_seq');
    new_code := 'Funny-' || next_number;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking totals
CREATE OR REPLACE FUNCTION calculate_booking_totals(p_booking_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_sell DECIMAL(12,2);
    v_total_cost DECIMAL(12,2);
    v_gross_profit DECIMAL(12,2);
BEGIN
    -- Calculate totals from all services
    SELECT
        COALESCE(SUM(sell_price), 0),
        COALESCE(SUM(total_cost), 0)
    INTO v_total_sell, v_total_cost
    FROM (
        SELECT sell_price, total_cost FROM booking_hotels WHERE booking_id = p_booking_id
        UNION ALL
        SELECT sell_price, total_cost FROM booking_tours WHERE booking_id = p_booking_id
        UNION ALL
        SELECT sell_price, cost_price FROM booking_transfers WHERE booking_id = p_booking_id
        UNION ALL
        SELECT sell_price, cost_price FROM booking_flights WHERE booking_id = p_booking_id
    ) all_services;

    v_gross_profit := v_total_sell - v_total_cost;

    -- Update booking totals
    UPDATE bookings
    SET
        total_sell_price = v_total_sell,
        total_cost_price = v_total_cost,
        gross_profit = v_gross_profit
    WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment status based on amount received
CREATE OR REPLACE FUNCTION update_payment_status(p_booking_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_sell DECIMAL(12,2);
    v_amount_received DECIMAL(12,2);
    v_new_status VARCHAR(30);
BEGIN
    -- Get total sell price and amount received
    SELECT total_sell_price, amount_received
    INTO v_total_sell, v_amount_received
    FROM bookings
    WHERE id = p_booking_id;

    -- Determine payment status
    IF v_amount_received = 0 THEN
        v_new_status := 'pending';
    ELSIF v_amount_received >= v_total_sell THEN
        v_new_status := 'paid';
    ELSE
        v_new_status := 'partial';
    END IF;

    -- Update payment status
    UPDATE bookings
    SET payment_status = v_new_status
    WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 11: TRIGGERS
-- ============================================================

-- Trigger to auto-calculate booking totals when services change
CREATE OR REPLACE FUNCTION trigger_calculate_booking_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_booking_totals(COALESCE(NEW.booking_id, OLD.booking_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_hotels_totals
AFTER INSERT OR UPDATE OR DELETE ON booking_hotels
FOR EACH ROW EXECUTE FUNCTION trigger_calculate_booking_totals();

CREATE TRIGGER trg_booking_tours_totals
AFTER INSERT OR UPDATE OR DELETE ON booking_tours
FOR EACH ROW EXECUTE FUNCTION trigger_calculate_booking_totals();

CREATE TRIGGER trg_booking_transfers_totals
AFTER INSERT OR UPDATE OR DELETE ON booking_transfers
FOR EACH ROW EXECUTE FUNCTION trigger_calculate_booking_totals();

CREATE TRIGGER trg_booking_flights_totals
AFTER INSERT OR UPDATE OR DELETE ON booking_flights
FOR EACH ROW EXECUTE FUNCTION trigger_calculate_booking_totals();

-- Trigger to auto-update payment status when client payment is added
CREATE OR REPLACE FUNCTION trigger_update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update amount_received in bookings table
    UPDATE bookings
    SET amount_received = (
        SELECT COALESCE(SUM(amount), 0)
        FROM client_payments
        WHERE booking_id = NEW.booking_id
    )
    WHERE id = NEW.booking_id;

    -- Update payment status
    PERFORM update_payment_status(NEW.booking_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_payments_status
AFTER INSERT OR UPDATE OR DELETE ON client_payments
FOR EACH ROW EXECUTE FUNCTION trigger_update_payment_status();

-- ============================================================
-- SECTION 12: INITIAL DATA (OPTIONAL)
-- ============================================================

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@funnytourism.com', '$2b$10$YourHashHere', 'System Administrator', 'admin');

-- ============================================================
-- SECTION 13: VIEWS (USEFUL QUERIES)
-- ============================================================

-- View: Outstanding Receivables (money to collect from clients)
CREATE OR REPLACE VIEW view_outstanding_receivables AS
SELECT
    b.booking_code,
    c.name AS client_name,
    c.type AS client_type,
    b.total_sell_price,
    b.amount_received,
    (b.total_sell_price - b.amount_received) AS outstanding_amount,
    b.payment_status,
    b.travel_date_from,
    CASE
        WHEN b.travel_date_from < CURRENT_DATE THEN 'overdue'
        WHEN b.travel_date_from <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'future'
    END AS urgency
FROM bookings b
JOIN clients c ON b.client_id = c.id
WHERE b.is_confirmed = TRUE
  AND b.payment_status != 'paid'
ORDER BY b.travel_date_from;

-- View: Outstanding Payables (money to pay suppliers)
CREATE OR REPLACE VIEW view_outstanding_payables AS
SELECT
    sp.id,
    b.booking_code,
    sp.supplier_type,
    sp.supplier_name,
    sp.amount,
    sp.due_date,
    sp.status,
    CASE
        WHEN sp.due_date < CURRENT_DATE THEN 'overdue'
        WHEN sp.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'future'
    END AS urgency
FROM supplier_payments sp
LEFT JOIN bookings b ON sp.booking_id = b.id
WHERE sp.status = 'pending'
ORDER BY sp.due_date;

-- View: Monthly Revenue Summary
CREATE OR REPLACE VIEW view_monthly_revenue AS
SELECT
    DATE_TRUNC('month', confirmed_at) AS month,
    COUNT(*) AS booking_count,
    SUM(total_sell_price) AS total_revenue,
    SUM(total_cost_price) AS total_costs,
    SUM(gross_profit) AS gross_profit,
    AVG(gross_profit) AS avg_profit_per_booking
FROM bookings
WHERE is_confirmed = TRUE
GROUP BY DATE_TRUNC('month', confirmed_at)
ORDER BY month DESC;

-- View: Booking Services Summary (all services for a booking)
CREATE OR REPLACE VIEW view_booking_services AS
SELECT
    b.id AS booking_id,
    b.booking_code,
    'hotel' AS service_type,
    bh.hotel_name AS service_name,
    bh.check_in AS service_date,
    bh.sell_price,
    bh.total_cost,
    bh.margin,
    bh.payment_status
FROM bookings b
JOIN booking_hotels bh ON b.id = bh.booking_id

UNION ALL

SELECT
    b.id AS booking_id,
    b.booking_code,
    'tour' AS service_type,
    bt.tour_name AS service_name,
    bt.tour_date AS service_date,
    bt.sell_price,
    bt.total_cost,
    bt.margin,
    bt.payment_status
FROM bookings b
JOIN booking_tours bt ON b.id = bt.booking_id

UNION ALL

SELECT
    b.id AS booking_id,
    b.booking_code,
    'transfer' AS service_type,
    CONCAT(btr.transfer_type, ': ', btr.from_location, ' → ', btr.to_location) AS service_name,
    btr.transfer_date AS service_date,
    btr.sell_price,
    btr.cost_price,
    btr.margin,
    btr.payment_status
FROM bookings b
JOIN booking_transfers btr ON b.id = btr.booking_id

UNION ALL

SELECT
    b.id AS booking_id,
    b.booking_code,
    'flight' AS service_type,
    CONCAT(bf.airline, ' ', bf.flight_number) AS service_name,
    DATE(bf.departure_date) AS service_date,
    bf.sell_price,
    bf.cost_price,
    bf.margin,
    bf.payment_status
FROM bookings b
JOIN booking_flights bf ON b.id = bf.booking_id;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

-- To verify installation, run:
-- SELECT 'Database schema created successfully!' AS status;
