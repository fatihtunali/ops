# Funny Tourism Operations Management System

A comprehensive tour operator management system built for Funny Tourism to manage bookings, suppliers, payments, and profitability tracking.

**Repository:** https://github.com/fatihtunali/ops

---

## 📋 Project Overview

This system replaces manual Excel tracking with an integrated platform that handles:
- Client management (agents & direct clients)
- Booking management (inquiry → quotation → confirmation → completion)
- Service management (hotels, tours, transfers, flights)
- Self-operated tour management (guides, vehicles, entrance fees)
- Payment tracking (receivables & payables)
- Financial reporting (P&L, profitability, cash flow)
- Automated voucher generation

**Target Users:** 5 concurrent users
**Expected Volume:** ~30 confirmed bookings/month
**Development Timeline:** 12 weeks

---

## 📁 Project Structure

```
ops/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Configuration files (database, env)
│   │   ├── controllers/       # Route controllers (business logic)
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Authentication, validation, error handling
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Helper functions, utilities
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components (Dashboard, Bookings, etc.)
│   │   ├── services/          # API client services
│   │   ├── utils/             # Helper functions
│   │   └── assets/            # Images, logos, static files
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── database/                   # Database files
│   ├── database_schema.sql    # Complete database schema (SOURCE OF TRUTH)
│   ├── migrations/            # Database migration scripts
│   ├── seeds/                 # Sample/test data
│   └── backups/               # Database backup files
│
├── docs/                       # Documentation
│   ├── guides/                # User guides, tutorials
│   ├── api/                   # API documentation
│   └── Funny_Tourism_Ops.md   # Complete project specification
│
├── deployment/                 # Deployment configurations
│   ├── docker/                # Docker files
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   └── nginx/                 # Nginx configurations
│       └── default.conf
│
├── tests/                      # Test files
│   ├── backend/               # Backend tests
│   └── frontend/              # Frontend tests
│
├── progress_tracker.md         # Development progress tracker
├── README.md                   # This file
└── .gitignore                 # Git ignore rules
```

---

## 🗄️ Database

### Database: PostgreSQL 12+
- **No ORM** - Direct SQL queries using `pg` (node-postgres)
- **Schema File:** `database/database_schema.sql` (SOURCE OF TRUTH)

### Key Database Features
- ✅ 13 core tables for complete operations
- ✅ Auto-generate booking codes (Funny-1046, 1047, etc.)
- ✅ Automated totals calculation (triggers)
- ✅ Payment status auto-updates
- ✅ Audit logging for all changes
- ✅ Pre-built views for common reports

### IMPORTANT: Database Change Protocol
```
⚠️ BEFORE making any database changes:
1. Check database/database_schema.sql
2. Make changes to the SQL file first
3. Update version and changelog in the file
4. Test changes on development database
5. Update progress_tracker.md with change log
6. Then apply to server database
```

---

## 🚀 Technology Stack

### Backend
- **Node.js 18+** + Express.js
- **PostgreSQL** (direct SQL, no ORM)
- **pg** (node-postgres) - PostgreSQL client
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** + Vite
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **Axios** - HTTP client

### Additional Tools
- **Puppeteer** or **PDFKit** - PDF voucher generation
- **Nodemailer** - Email automation
- **ExcelJS** - Excel exports
- **Docker** - Containerization
- **Nginx** - Reverse proxy

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed
- Git installed

### 1. Clone Repository
```bash
git clone https://github.com/fatihtunali/ops.git
cd ops
```

### 2. Database Setup
```bash
# Create database
createdb funny_tourism

# Import schema
psql -U postgres -d funny_tourism -f database/database_schema.sql

# Verify installation
psql -U postgres -d funny_tourism -c "SELECT 'Database schema created successfully!' AS status;"
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/funny_tourism
JWT_SECRET=your_jwt_secret_here_change_this
NODE_ENV=development
EOF

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

### 5. Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 🔐 Default Login (After Setup)

```
Username: admin
Password: admin123

⚠️ CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN
```

---

## 📊 Development Progress

Track development progress in `progress_tracker.md`

### Current Status: Phase 1 - Week 1
- ✅ Database schema created
- ✅ Folder structure organized
- ⏳ Backend API framework
- ⏳ Frontend framework
- ⏳ Authentication system

See [progress_tracker.md](progress_tracker.md) for detailed status.

---

## 📖 Documentation

### Main Documentation
- **[Funny_Tourism_Ops.md](Funny_Tourism_Ops.md)** - Complete system specification, requirements, and design

### Database Documentation
- **[database/database_schema.sql](database/database_schema.sql)** - Complete database schema with comments

### Progress Tracking
- **[progress_tracker.md](progress_tracker.md)** - Development progress, completed tasks, blockers

---

## 🗂️ Key Workflows

### Creating a Booking
1. Create inquiry (auto-generates Funny-XXXX code)
2. Add services (hotels, tours, transfers, flights)
3. System calculates total cost, sell price, margin
4. Update status to "Quoted"
5. Client confirms → Update to "Confirmed"
6. Generate vouchers (PDF)
7. Track payments (client payments & supplier payments)
8. Complete booking

### Payment Tracking
- **Client Payments:** Record payments against booking
- **Supplier Payments:** Track what you owe to hotels, guides, etc.
- **Automatic Updates:** Payment status updates automatically

### Financial Reports
- Monthly P&L (Revenue - Costs - Expenses = Net Profit)
- Per-booking profitability
- Outstanding receivables/payables
- Sales by client/service type

---

## 🔧 Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# Backup database
pg_dump -U postgres funny_tourism > database/backups/backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres funny_tourism < database/backups/backup_20251206.sql

# Run migrations (when created)
psql -U postgres funny_tourism -f database/migrations/001_migration_name.sql
```

---

## 🚢 Deployment

### Docker Deployment (Recommended)
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Deployment
1. Set up PostgreSQL on server
2. Import database schema
3. Build frontend: `npm run build`
4. Deploy backend with PM2
5. Configure Nginx reverse proxy
6. Set up SSL certificate (Let's Encrypt)

See `deployment/` folder for configuration files.

---

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ SQL injection prevention (parameterized queries)
- ✅ HTTPS/SSL encryption
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Regular automated backups

---

## 📝 Coding Standards

### Backend (Node.js)
- Use async/await for asynchronous operations
- Parameterized queries (never string concatenation)
- Proper error handling (try-catch)
- Meaningful variable names
- Comments for complex logic

### Frontend (React)
- Functional components with hooks
- Props validation
- Responsive design (mobile-first)
- Loading states for async operations
- Error boundaries

### Database
- Always check `database_schema.sql` before changes
- Document all changes in file comments
- Update changelog in progress_tracker.md
- Test on development database first

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U postgres -d funny_tourism -c "SELECT version();"
```

### Backend Won't Start
- Check `.env` file exists and has correct values
- Check PostgreSQL is running
- Check port 5000 is not in use
- Check npm dependencies installed

### Frontend Won't Start
- Check `.env` file has correct API URL
- Check port 5173 is not in use
- Check npm dependencies installed
- Clear browser cache

---

## 📞 Support & Contact

### During Development
- Check `progress_tracker.md` for blockers and notes
- Review `Funny_Tourism_Ops.md` for specifications
- Check GitHub issues: https://github.com/fatihtunali/ops/issues

### After Deployment
- User guides in `docs/guides/`
- API documentation in `docs/api/`
- System administrator guide (TBD)

---

## 📅 Development Timeline

**Total Duration:** 12 weeks

- **Phase 1 (Weeks 1-2):** Foundation & Infrastructure
- **Phase 2 (Weeks 3-5):** Core Booking System
- **Phase 3 (Weeks 6-7):** Inventory Management
- **Phase 4 (Weeks 8-9):** Payment Tracking
- **Phase 5 (Weeks 10-11):** Financial System
- **Phase 6 (Week 12):** Vouchers & Polish

See [progress_tracker.md](progress_tracker.md) for detailed breakdown.

---

## 🎯 Project Goals

### Primary Goals
1. ✅ Replace Excel-based tracking
2. ⏳ Real-time profitability visibility
3. ⏳ Automated voucher generation
4. ⏳ Complete payment tracking
5. ⏳ Financial reporting (P&L, cash flow)

### Success Metrics
- Reduce booking creation time: 75% (from 20 min to 5 min)
- Eliminate manual data entry errors: 100%
- Real-time financial visibility: Yes
- Staff time saved: 15-20 hours/week
- Capacity increase: 3x (from 30 to 90 bookings/month)

---

## 📄 License

Proprietary - Funny Tourism Operations

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1.0 | 2025-12-06 | Initial project setup, database schema, folder structure | Claude |

---

## ⚡ Quick Start (For Developers)

```bash
# 1. Clone and setup
git clone https://github.com/fatihtunali/ops.git
cd ops

# 2. Database
createdb funny_tourism
psql -U postgres -d funny_tourism -f database/database_schema.sql

# 3. Backend
cd backend
npm install
cp .env.example .env  # Edit with your settings
npm run dev

# 4. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env  # Edit with your settings
npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

**Last Updated:** 2025-12-06
**Status:** 🟡 In Development (Phase 1, Week 1)
**Next Milestone:** Complete authentication system
