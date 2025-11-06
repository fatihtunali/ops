# Database Connection Information (TEMPLATE)

⚠️ **DO NOT COMMIT REAL CREDENTIALS TO GIT!**

This is a template file. Copy this to `DATABASE_CONNECTION.md` and fill in your actual credentials.
The real `DATABASE_CONNECTION.md` file is ignored by git (.gitignore).

---

## Server Details

**Server IP:** YOUR_SERVER_IP
**Database System:** PostgreSQL 14+
**Database Name:** ops
**Database User:** ops
**Database Password:** YOUR_PASSWORD_HERE

---

## Connection String

```
postgresql://ops:YOUR_PASSWORD@YOUR_SERVER_IP:5432/ops
```

---

## Connection Parameters

For application configuration (.env file):

```env
DATABASE_HOST=YOUR_SERVER_IP
DATABASE_PORT=5432
DATABASE_USER=ops
DATABASE_PASSWORD=YOUR_PASSWORD_HERE
DATABASE_NAME=ops
DATABASE_URL=postgresql://ops:YOUR_PASSWORD@YOUR_SERVER_IP:5432/ops
```

---

## User Permissions

The `ops` user should have:
- ✅ SUPERUSER privilege
- ✅ CREATEDB privilege
- ✅ CREATEROLE privilege
- ✅ Full access to `ops` database

---

## Database Schema Status

### Tables: 17
1. users
2. clients
3. hotels
4. tour_suppliers
5. guides
6. vehicles
7. bookings
8. passengers
9. booking_hotels
10. booking_tours
11. booking_transfers
12. booking_flights
13. client_payments
14. supplier_payments
15. operational_expenses
16. vouchers
17. audit_log

### Views: 4
1. view_outstanding_receivables
2. view_outstanding_payables
3. view_monthly_revenue
4. view_booking_services

### Functions: 4
1. generate_booking_code()
2. calculate_booking_totals()
3. update_payment_status()
4. trigger functions

---

## Connection Test

```bash
PGPASSWORD='YOUR_PASSWORD' psql -U ops -d ops -h YOUR_SERVER_IP -c "SELECT 'Connected!' AS status;"
```

---

## psql Command Line Access

### From Local Machine:
```bash
PGPASSWORD='YOUR_PASSWORD' psql -U ops -d ops -h YOUR_SERVER_IP
```

### From Server:
```bash
sudo -u postgres psql -d ops
```

---

## Backup Commands

### Create backup:
```bash
ssh root@YOUR_SERVER_IP "sudo -u postgres pg_dump ops" > database/backups/ops_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore backup:
```bash
cat database/backups/ops_backup_YYYYMMDD_HHMMSS.sql | ssh root@YOUR_SERVER_IP "sudo -u postgres psql -d ops"
```

---

## Security Notes

⚠️ **CRITICAL SECURITY REMINDERS:**
- NEVER commit real passwords to git
- NEVER share credentials in chat/email
- Use .env files for sensitive data
- Keep DATABASE_CONNECTION.md LOCAL ONLY
- For production, use managed secrets (AWS Secrets Manager, etc.)
- Enable SSL/TLS for production connections
- Use strong, unique passwords

---

**Last Updated:** YYYY-MM-DD
**Status:** Template file - Fill in your actual credentials locally
