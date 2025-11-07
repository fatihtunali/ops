# Security Guide - Secrets Management

## ⚠️ CRITICAL: Never Expose Secrets to Git

This project uses a strict security policy to prevent accidental exposure of sensitive data.

## Quick Security Check

Before every commit, run:

```bash
cd backend
npm run check-secrets
```

This should output: `✅ No hardcoded secrets detected!`

## What Are Secrets?

**Secrets** are any sensitive data that must never be committed to git:

- ✅ Passwords (database, admin, user, etc.)
- ✅ API Keys (Stripe, Brevo, AWS, Google, etc.)
- ✅ SMTP credentials
- ✅ Database connection strings with passwords
- ✅ JWT secrets
- ✅ OAuth tokens
- ✅ Private keys
- ✅ Session secrets
- ✅ Encryption keys
- ✅ Any authentication tokens

## Security Rules

### ❌ NEVER Do This:

```javascript
// Hardcoded password - WRONG!
const password = 'MySecretPassword123';

// Hardcoded API key - WRONG!
const apiKey = 'sk_live_abc123xyz';

// Hardcoded connection string - WRONG!
const dbUrl = 'postgresql://user:pass@host/db';

// Hardcoded in test files - WRONG!
const testPassword = 'admin123';
```

### ✅ ALWAYS Do This:

```javascript
// Use environment variables - CORRECT!
const password = process.env.ADMIN_PASSWORD;
const apiKey = process.env.STRIPE_API_KEY;
const dbUrl = process.env.DATABASE_URL;
const smtpKey = process.env.BREVO_SMTP_KEY;
```

## Environment Variables Setup

### 1. Create .env file (local development)

```bash
cd backend
cp .env.example .env
```

### 2. Edit .env with your actual secrets

```env
# DO NOT commit this file!
DATABASE_PASSWORD=your_real_password
JWT_SECRET=generate_random_string_here
ADMIN_PASSWORD=your_secure_password
BREVO_SMTP_KEY=your_actual_key
```

### 3. Verify .env is in .gitignore

The `.gitignore` file must include:

```
.env
.env.local
*.env
```

## Production Deployment

For production servers, set environment variables directly:

### Option 1: Server Environment Variables

```bash
# Linux/Mac
export DATABASE_PASSWORD="your_password"
export JWT_SECRET="your_secret"

# Windows
set DATABASE_PASSWORD=your_password
set JWT_SECRET=your_secret
```

### Option 2: Process Manager (PM2)

```bash
pm2 start server.js --name "funny-tourism" \
  --env DATABASE_PASSWORD=your_password \
  --env JWT_SECRET=your_secret
```

### Option 3: Docker Environment

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
```

## Security Scanner

### Automated Scanning

The security scanner (`check-secrets.js`) automatically detects:

- Hardcoded passwords
- API keys
- Tokens
- Database credentials
- SMTP credentials
- Secret keys
- Connection strings with credentials

### Run Manually

```bash
cd backend
node scripts/check-secrets.js
```

### Run via npm

```bash
cd backend
npm run check-secrets
```

### Pre-Commit Hook (Optional)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
cd backend && npm run check-secrets
if [ $? -ne 0 ]; then
  echo "❌ Security check failed! Fix hardcoded secrets before committing."
  exit 1
fi
```

## Common Mistakes to Avoid

### 1. Committing .env file

```bash
# WRONG - .env file in git
git add .env
git commit -m "Added config"

# CORRECT - Only commit .env.example
git add .env.example
git commit -m "Updated config template"
```

### 2. Hardcoding in test files

```javascript
// WRONG - hardcoded in test
const password = 'admin123';

// CORRECT - use env vars
const password = process.env.ADMIN_PASSWORD || 'test_password';
```

### 3. Console logging secrets

```javascript
// WRONG - secret in logs
console.log('API Key:', process.env.API_KEY);

// CORRECT - never log secrets
console.log('API Key: [REDACTED]');
```

### 4. Keeping one-time scripts

```javascript
// Delete one-time scripts after use:
// - reset-password.js
// - seed-admin.js
// - debug-credentials.js
```

## Recovery from Leaked Secrets

If you accidentally commit secrets:

### 1. Immediately Rotate Credentials

- Change all exposed passwords
- Regenerate API keys
- Revoke tokens
- Update database credentials

### 2. Remove from Git History

```bash
# Use git filter-branch or BFG Repo Cleaner
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous - coordinate with team)
git push origin --force --all
```

### 3. Notify Your Team

- Inform all team members
- Update all deployment environments
- Review access logs for suspicious activity

## Compliance Checklist

Before every commit:

- [ ] Ran `npm run check-secrets` successfully
- [ ] No `.env` files in git status
- [ ] All secrets use `process.env.*`
- [ ] `.env.example` only has placeholder values
- [ ] One-time scripts are deleted
- [ ] No secrets in console logs
- [ ] No secrets in error messages

## Additional Resources

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [12 Factor App - Config](https://12factor.net/config)

---

**Last Updated:** 2025-11-07
**Security Level:** CRITICAL
**Mandatory:** YES
