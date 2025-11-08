# 🔐 SECURITY GUIDELINES - READ BEFORE COMMITTING

**⚠️ CRITICAL: NEVER COMMIT SECRETS TO GIT**

This document exists because we had a security incident where database credentials were accidentally committed to git. **This must NEVER happen again.**

---

## 🚨 What NEVER Goes in Git

**NEVER commit these to git:**
- ❌ Passwords
- ❌ Database credentials (username, password, host, port)
- ❌ API keys
- ❌ JWT secrets
- ❌ OAuth tokens
- ❌ Private keys (.pem, .key files)
- ❌ SSH keys
- ❌ .env files with real credentials
- ❌ DATABASE_CONNECTION.md with real credentials
- ❌ Any file containing "password", "secret", "key", "token" with real values

---

## ✅ What Goes in Git

**SAFE to commit:**
- ✅ .env.example (with placeholder values)
- ✅ DATABASE_CONNECTION.example.md (with fake credentials)
- ✅ Documentation with PLACEHOLDER values
- ✅ Code that reads from environment variables
- ✅ Configuration templates

---

## 📋 Pre-Commit Checklist

**Before every `git add` or `git commit`, verify:**

1. **Check what you're committing:**
   ```bash
   git diff
   git status
   ```

2. **Search for secrets:**
   ```bash
   # Check for passwords
   git diff | grep -i "password"

   # Check for database URLs
   git diff | grep -i "postgresql://"

   # Check for IP addresses
   git diff | grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"

   # Check for secrets
   git diff | grep -i "secret"
   ```

3. **Review files being added:**
   ```bash
   # Make sure .env is NOT in the list
   git status
   ```

4. **Verify .gitignore is protecting secrets:**
   ```bash
   cat .gitignore | grep -E "(\.env|DATABASE_CONNECTION\.md)"
   ```

---

## 🛡️ Protected Files (Already in .gitignore)

These files are protected and will NEVER be committed:
```
.env
backend/.env
frontend/.env
database/DATABASE_CONNECTION.md
*.pem
*.key
```

---

## 📝 How to Handle Credentials

### ❌ WRONG - DO NOT DO THIS:

```markdown
# In documentation
DATABASE_URL=postgresql://ops:MyRealPassword123@10.0.0.1:5432/ops
```

```env
# In .env file (and committing it)
DB_PASSWORD=MyRealPassword123
```

### ✅ CORRECT - DO THIS:

**In Documentation:**
```markdown
DATABASE_URL=postgresql://username:password@your-host:5432/database_name
```

**In .env file (NEVER commit):**
```env
DB_PASSWORD=MyRealPassword123
```

**In .env.example file (safe to commit):**
```env
DB_PASSWORD=your_password_here
```

---

## 🚑 If You Accidentally Commit Secrets

**STOP IMMEDIATELY and follow these steps:**

1. **DO NOT PUSH** to GitHub if you haven't already
2. **Alert the team** immediately
3. **Remove the secret** from the file
4. **Amend the commit** (if not pushed):
   ```bash
   git add .
   git commit --amend
   ```
5. **If already pushed** to GitHub:
   - Change the password/secret IMMEDIATELY
   - Contact admin to rewrite git history
   - Never use the exposed secret again

---

## 🔍 How to Check for Secrets in Git History

```bash
# Search for a specific secret
git log -S "password_text" --all --source

# Search for database URLs
git log -G "postgresql://" --all --source

# Check a specific file's history
git log -p -- SYSTEM_ANALYSIS.md | grep -i "password"
```

---

## 📚 Where to Store Secrets

### Local Development:
- `.env` files (in .gitignore)
- `database/DATABASE_CONNECTION.md` (in .gitignore)

### Production:
- Environment variables on server
- Secure vault systems (AWS Secrets Manager, Azure Key Vault, etc.)
- Encrypted configuration management

---

## 🎯 Example: Good vs Bad

### ❌ BAD Example:
```javascript
// server.js
const db = new Pool({
  user: 'ops',
  password: 'MyRealPassword123',
  host: '10.0.0.1',
  port: 5432,
  database: 'ops'
});
```

### ✅ GOOD Example:
```javascript
// server.js
const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});
```

---

## 🔐 Security Incident Log

### Incident #1 - 2025-11-08
- **What happened:** Database password and host IP leaked in SYSTEM_ANALYSIS.md
- **Password exposed:** Yes (in git history)
- **IP exposed:** Yes (in git history)
- **Resolution:** Git history rewritten, all credentials redacted
- **Action taken:** Created SECURITY_GUIDELINES.md, mandatory pre-commit checks
- **Lesson learned:** Always use placeholders in documentation, never commit real IPs or passwords

---

## ✅ Final Reminder

**Before every commit, ask yourself:**
> "Would I be comfortable if this commit appeared on the front page of a newspaper?"

If the answer is NO, **don't commit it**.

---

## 📞 Questions?

If you're unsure whether something should be committed:
1. Assume it's sensitive
2. Ask the team
3. When in doubt, leave it out

**Better safe than sorry!**

---

**Last Updated:** 2025-11-08
**Next Review:** Before every commit
