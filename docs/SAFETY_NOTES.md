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

### Database Credentials
- ✅ Never commit `.env` files
- ✅ Never commit files with passwords
- ✅ Always use `.gitignore`

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
