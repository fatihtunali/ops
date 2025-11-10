# Project Context - Funny Tourism Operations

**Last Updated:** 2025-11-10
**Purpose:** Critical information to remember across all sessions

---

## 🚨 CRITICAL REMINDERS

### User's Key Instructions:
1. **"ULTRATHINK before you do something"** - Always think through the implications before acting
2. **"Don't do anything before my approval"** - Never assume, always ask first
3. **"I want in full - never leave anything half"** - Complete features fully, not partially
4. **"Please fix it how you did for transfers"** - Follow existing patterns, don't invent new ones
5. **"Don't rush"** - Take time to do things properly

---

## 📅 DATE FORMAT STANDARDS

### Display Format (EVERYWHERE):
- **Format:** `dd/mm/yyyy` (e.g., 27/04/2026)
- **NOT:** mm/dd/yyyy or any other format
- **Time:** 24-hour format `hh:mm` (e.g., 14:30)

### Database Format:
- **Internal Storage:** `YYYY-MM-DD` (PostgreSQL format)
- **Conversion:** Frontend must convert dd/mm/yyyy → YYYY-MM-DD when sending to API
- **Display:** Backend returns YYYY-MM-DD, frontend displays as dd/mm/yyyy

### Implementation Pattern:
```javascript
// Converting DD/MM/YYYY to YYYY-MM-DD for database
const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const match = dateString.match(ddmmyyyyRegex);
if (match) {
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}
```

---

## 💰 CURRENCY & EXCHANGE RATES

### Supported Currencies:
- **EUR** (Euro) - Base currency
- **USD** (US Dollar)
- **GBP** (British Pound)
- **TRY** (Turkish Lira)

### Exchange Rates to EUR:
```javascript
const exchangeRates = {
  EUR: 1,
  USD: 0.92,    // 1 USD = 0.92 EUR
  GBP: 1.17,    // 1 GBP = 1.17 EUR
  TRY: 0.027,   // 1 TRY = 0.027 EUR
};
```

### Currency Conversion:
- **Expenses:** All expenses can be entered in any currency
- **Reports:** P&L and financial reports must show consolidated total in EUR
- **Backend:** SQL queries must convert all currencies to EUR using CASE statements
- **Frontend:** Display breakdown by currency + consolidated EUR total

---

## 🖥️ SERVER CONFIGURATION

### Environment:
- **Server IP:** `$PROD_SERVER_IP` (set in your local environment)
- **OS:** Ubuntu Linux (DigitalOcean)
- **User:** Operations run under **`ops`** user (NOT root)

### Backend:
- **Process Manager:** PM2
- **Process Name:** ops-backend
- **Port:** 5000
- **Start Command:** `cd /home/ops/ops/backend && npm start`

### PM2 Commands (IMPORTANT):
```bash
# Set your server IP as environment variable:
# export PROD_SERVER_IP=your.server.ip

# CORRECT way (as ops user):
ssh root@$PROD_SERVER_IP "su - ops -c 'pm2 list'"
ssh root@$PROD_SERVER_IP "su - ops -c 'pm2 restart ops-backend'"
ssh root@$PROD_SERVER_IP "su - ops -c 'pm2 logs ops-backend'"

# WRONG way (will fail):
ssh root@$PROD_SERVER_IP "pm2 restart ops-backend"  # ❌ Wrong user
```

### Frontend:
- **Build Location:** `/home/ops/ops/frontend/dist`
- **Web Server:** Nginx serves static files
- **Build Command:** `cd /home/ops/ops/frontend && npm run build`

### Database:
- **Type:** PostgreSQL
- **Host:** localhost (on server)
- **Database:** ops
- **User:** ops

---

## 🔄 DEPLOYMENT WORKFLOW

### Standard Deployment Steps:
1. **Local Development:**
   ```bash
   # Make changes locally
   git add .
   git commit -m "message"
   git push origin master
   ```

2. **Server Deployment:**
   ```bash
   # Set server IP (one time per session)
   export PROD_SERVER_IP=your.server.ip

   # Pull latest code
   ssh root@$PROD_SERVER_IP "cd /home/ops/ops && git pull origin master"

   # Build frontend
   ssh root@$PROD_SERVER_IP "cd /home/ops/ops/frontend && npm run build"

   # Restart backend (as ops user)
   ssh root@$PROD_SERVER_IP "su - ops -c 'pm2 restart ops-backend'"

   # Check logs
   ssh root@$PROD_SERVER_IP "su - ops -c 'pm2 logs ops-backend --lines 20 --nostream'"
   ```

---

## 🎯 PROJECT PATTERNS TO FOLLOW

### Code Structure:
1. **Services:** All API calls go through service files (e.g., `expensesService.js`)
2. **Controllers:** Backend controllers follow standard pattern (getAll, getById, create, update, delete)
3. **UI Pattern:** List view → Modal for Add/Edit → Delete confirmation
4. **Date Inputs:** Use `type="date"` but convert format before sending to API

### Existing Patterns (FOLLOW THESE):
- **Hotels Management** → Full CRUD with modal forms
- **Tours Management** → Service cards with inline editing
- **Transfers Management** → List with filters
- **Expenses Management** → Latest pattern with currency conversion

### Component Standards:
```javascript
// Common imports
import { Card, Button, Input, Badge, Loader, Modal } from '@components/common';
import { useToast } from '@context/ToastContext';
import { formatCurrency, formatDate } from '@utils/formatters';

// State management
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({});
const [formErrors, setFormErrors] = useState({});
```

---

## 🏗️ BUSINESS LOGIC

### Booking System:
- **Markup:** Fixed amount per person applied at booking level (NOT percentage)
- **Services:** Only store net/cost prices (no sell price or margin at service level)
- **Calculation:** `Total Sell = Total Cost + (Markup Per Person × PAX Count)`
- **Gross Profit:** `Gross Profit = Total Sell - Total Cost`

### Operational Expenses:
- **Multi-Currency:** Support EUR, USD, GBP, TRY
- **Reporting:** Always convert to EUR for P&L reports
- **Categories:** Rent, Salaries, Utilities, Marketing, Office Supplies, Insurance, Transportation, Software & Subscriptions, Professional Services, Maintenance, Travel, Other
- **Recurring:** Can mark expenses as recurring for tracking

---

## 🔍 COMMON ISSUES & SOLUTIONS

### Issue: Backend not restarting
**Solution:** Use correct command: `su - ops -c 'pm2 restart ops-backend'`

### Issue: Dates saving incorrectly
**Solution:** Ensure dd/mm/yyyy is converted to YYYY-MM-DD before API call

### Issue: Currency totals wrong in reports
**Solution:** Check SQL CASE statement is converting all currencies to EUR

### Issue: HTTP 304 / Stale data in frontend
**Solution:** Cache-busting headers already added to api.js

### Issue: Services not saving
**Solution:** Check date format conversion in cleanServiceData function

---

## 📝 COMMIT MESSAGE FORMAT

### Standard Format:
```
feat/fix/chore: Brief description

- Detailed point 1
- Detailed point 2
- Detailed point 3

Features/Changes:
- Feature A
- Feature B

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🎓 KEY LEARNINGS

1. **Always read FORMAT_STANDARDS.md** at the start of complex tasks
2. **Follow existing patterns** - don't invent new approaches
3. **Test locally first** when possible (but don't get stuck on local server issues)
4. **Check PM2 logs** after deployment to verify success
5. **Ask before assuming** - the user knows the requirements best

---

## 📚 IMPORTANT FILES TO REFERENCE

- `docs/FORMAT_STANDARDS.md` - Date, currency, and format standards
- `docs/QUICK_REFERENCE_DATA_MAPPING.md` - Database field mappings
- `database/database_schema.sql` - Database structure
- `docs/api/*.md` - API documentation

---

**Remember: ULTRATHINK → ASK → IMPLEMENT → TEST → DEPLOY**
