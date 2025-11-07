# Critical Safety Notes

⚠️ **EXTREMELY IMPORTANT** ⚠️

## DO NOT Kill Node Processes Globally

### ❌ NEVER USE THESE COMMANDS:

```bash
taskkill //F //IM node.exe  # Windows
killall node                # Linux/Mac
pkill node                  # Linux/Mac
kill $(ps aux | grep node)  # Any system
```

### ⚠️ WHY THIS IS DANGEROUS:

These commands kill **ALL Node.js processes** on the system, including:
- Claude Code itself (if running on Node.js)
- Other development servers
- Background services
- System tools

**Result:** You will kill Claude Code and lose your session!

---

## ✅ Safe Alternatives

### To Stop Backend Server:

**Option 1: Use Ctrl+C in the terminal**
```bash
# In the terminal running the server, press Ctrl+C
```

**Option 2: Kill specific port (safer)**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid_number> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

**Option 3: Use process manager**
```bash
# If using PM2
pm2 stop funny-tourism-backend
pm2 delete funny-tourism-backend
```

---

## Other Safety Rules

### Database Credentials & Secrets Management

⚠️ **CRITICAL: NEVER EXPOSE SECRETS TO GIT** ⚠️

**Security Rules:**
- ✅ **NEVER hardcode credentials in scripts**
- ✅ **ALWAYS use environment variables** (process.env.*)
- ✅ Never commit `.env` files
- ✅ Never commit files with passwords, API keys, tokens
- ✅ Always use `.gitignore`
- ✅ Use `.env.example` with placeholders only
- ✅ Run security scanner before commits
- ✅ All secrets must come from process.env

**❌ WRONG - Hardcoded Secrets:**
```javascript
const password = 'MySecretPassword123'; // NEVER DO THIS!
const apiKey = 'sk_live_abc123xyz'; // NEVER DO THIS!
const dbUrl = 'postgresql://user:pass@host/db'; // NEVER DO THIS!
const smtpKey = 'xkeysib-abc123'; // NEVER DO THIS!
```

**✅ CORRECT - Environment Variables:**
```javascript
const password = process.env.ADMIN_PASSWORD;
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;
const smtpKey = process.env.BREVO_SMTP_KEY;
```

**Security Scanner:**
```bash
# Run before every commit
cd backend && node scripts/check-secrets.js

# Should output: ✅ No hardcoded secrets detected!
```

**What Counts as a Secret:**
- Passwords (any kind)
- API Keys (Stripe, Brevo, AWS, etc.)
- Database credentials
- SMTP credentials
- JWT secrets
- OAuth tokens
- Private keys
- Connection strings with credentials
- Any authentication tokens

### Server Operations
- ✅ Always backup before making database changes
- ✅ Test on development first
- ✅ Never run `DROP DATABASE` on production

### Code Execution
- ✅ Review commands before running
- ✅ Never run unknown scripts
- ✅ Be careful with `rm -rf` or `del /f`

### One-Time Scripts
- ✅ **DELETE** one-time scripts after use
- ✅ Scripts like `seedAdmin.js` are for initial setup only
- ✅ Once data is in database, delete the script
- ✅ Keep project clean - no unnecessary files
- ✅ Document what was done, then remove the script

**Example:** After running `backend/scripts/seedAdmin.js` and confirming admin user exists, DELETE the script.

---

**Last Updated:** 2025-12-06
**Critical Priority:** HIGH
