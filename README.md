# Funny Tourism Operations Management System

A comprehensive tour operator management system built with React, Node.js, and PostgreSQL.

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%2014.19-blue)]()
[![React](https://img.shields.io/badge/react-19.1.1-61dafb)]()
[![Node](https://img.shields.io/badge/node-18%2B-green)]()

---

## Quick Start

### Login
```
URL: http://localhost:5173
Username: admin
Email: fatihtunali@gmail.com
```

### Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## System Overview

- **Database:** 17 tables, 71 API endpoints
- **Bookings:** Auto-generated codes (Funny-1046, Funny-1047, ...)
- **Services:** Hotels, Tours, Transfers, Flights
- **Payments:** Client & Supplier tracking
- **Reports:** P&L, Cash Flow, Profitability

---

## Documentation

📖 **Complete Documentation:** See [SYSTEM_ANALYSIS.md](SYSTEM_ANALYSIS.md)

---

## Tech Stack

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React 19.1.1 + Vite + Tailwind CSS
- **Database:** PostgreSQL 14.19 (YOUR_HOST_IP)
- **Authentication:** JWT
- **Security:** bcrypt, parameterized queries, RBAC

---

## Key Features

✅ Booking Management (Inquiry → Confirmed → Completed)
✅ Multi-Service Support (Hotels, Tours, Transfers, Flights)
✅ Self-Operated Tour Management (Guides, Vehicles)
✅ Payment Tracking (Auto-update status)
✅ Financial Reports (P&L, Cash Flow)
✅ Real-Time Profitability
✅ Excel Exports

---

## Database

- **Tables:** 17 core tables
- **Functions:** 4 automated functions
- **Triggers:** 8 automatic calculations
- **Views:** 4 reporting views

**Connection:**
```
Host: YOUR_HOST_IP
Database: ops
User: ops
```

---

## API Endpoints

**Total:** 71 endpoints across 18 modules

Base URL: `http://localhost:5000/api`

- Authentication (3)
- Users (7)
- Clients (5)
- Bookings (5)
- Booking Services (22)
- Payments (11)
- Reports (12)
- More... (see SYSTEM_ANALYSIS.md)

---

## Current Status

✅ **Database:** Clean, ready for production
✅ **Backend:** 71 endpoints operational
✅ **Frontend:** Complete UI implementation
✅ **Security:** All measures active
✅ **Next Booking:** Funny-1046

---

## Repository

**GitHub:** https://github.com/fatihtunali/ops

---

## License

Proprietary - Funny Tourism Operations

---

**Last Updated:** 2025-11-08
**Version:** 2.0
**Status:** 🟢 Production Ready
