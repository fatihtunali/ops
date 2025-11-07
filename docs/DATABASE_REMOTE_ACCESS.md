# PostgreSQL Remote Access Configuration

**Last Updated:** 2025-11-07

---

## Enable Remote Access to PostgreSQL Database

To allow your backend server to connect to the PostgreSQL database from any IP address, you need to configure two files on your database server:

---

## Step 1: Edit postgresql.conf

1. **SSH into your database server:**
   ```bash
   ssh root@YOUR_HOST_IP
   ```

2. **Find and edit postgresql.conf:**
   ```bash
   # Usually located in /etc/postgresql/14/main/postgresql.conf
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```

3. **Find the line:**
   ```
   #listen_addresses = 'localhost'
   ```

4. **Change it to:**
   ```
   listen_addresses = '*'
   ```
   This tells PostgreSQL to listen on all network interfaces.

5. **Save and exit** (Ctrl+X, then Y, then Enter)

---

## Step 2: Edit pg_hba.conf

1. **Edit pg_hba.conf:**
   ```bash
   # Usually located in /etc/postgresql/14/main/pg_hba.conf
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```

2. **Add the following line at the end of the file:**
   ```
   # Allow connections from all IP addresses (use with caution!)
   host    all             all             0.0.0.0/0               md5
   ```

   **Or, for better security, allow only specific IP addresses:**
   ```
   # Allow connections from specific IP
   host    all             all             YOUR_IP_ADDRESS/32      md5

   # Allow connections from IP range
   host    all             all             10.0.0.0/24             md5
   ```

3. **Recommended pg_hba.conf configuration for Funny Tourism:**
   ```
   # TYPE  DATABASE        USER            ADDRESS                 METHOD

   # Local connections
   local   all             all                                     peer

   # IPv4 local connections
   host    all             all             127.0.0.1/32            md5

   # Allow ops user from anywhere (for backend connections)
   host    ops             ops             0.0.0.0/0               md5

   # Or better: Allow ops user from specific IPs only
   # host    ops             ops             YOUR_OFFICE_IP/32       md5
   # host    ops             ops             YOUR_SERVER_IP/32       md5
   ```

4. **Save and exit** (Ctrl+X, then Y, then Enter)

---

## Step 3: Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

**Or for PostgreSQL 14 specifically:**
```bash
sudo systemctl restart postgresql@14-main
```

**Check status:**
```bash
sudo systemctl status postgresql
```

---

## Step 4: Configure Firewall

Make sure port 5432 is open in your firewall:

```bash
# For ufw (Ubuntu)
sudo ufw allow 5432/tcp

# For firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

**For DigitalOcean Droplets:**
- Go to your droplet in the DigitalOcean control panel
- Click on "Networking" tab
- Add firewall rule to allow TCP port 5432

---

## Step 5: Test Connection

From your local machine or backend server:

```bash
psql -h YOUR_HOST_IP -U ops -d ops
```

Enter the password when prompted. If successful, you'll see the PostgreSQL prompt.

**Or test with Node.js:**
```javascript
const { Client } = require('pg');

const client = new Client({
  host: 'YOUR_HOST_IP',
  port: 5432,
  user: 'ops',
  password: 'YOUR_PASSWORD',
  database: 'ops'
});

client.connect()
  .then(() => console.log('✅ Connected successfully!'))
  .catch(err => console.error('❌ Connection error:', err))
  .finally(() => client.end());
```

---

## Security Best Practices

### ⚠️ Important Security Notes:

1. **Don't use 0.0.0.0/0 in production!**
   - This allows connections from ANY IP address
   - Only use this for development/testing
   - In production, specify exact IP addresses

2. **Use strong passwords:**
   - Database user passwords should be long and random
   - Store passwords in environment variables, never in code

3. **Use SSL/TLS:**
   Add to pg_hba.conf:
   ```
   hostssl    ops             ops             0.0.0.0/0               md5
   ```
   This requires SSL connections.

4. **Recommended Production Setup:**
   ```
   # Only allow specific servers
   host    ops             ops             YOUR_BACKEND_SERVER_IP/32    md5
   host    ops             ops             YOUR_OFFICE_IP/32            md5
   ```

5. **Monitor connections:**
   ```bash
   # View active connections
   sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
   ```

---

## Troubleshooting

### Connection still refused?

1. **Check PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Check PostgreSQL is listening on port 5432:**
   ```bash
   sudo netstat -plnt | grep 5432
   ```
   Should show: `0.0.0.0:5432` or `*:5432`

3. **Check firewall rules:**
   ```bash
   # For ufw
   sudo ufw status

   # For firewalld
   sudo firewall-cmd --list-all
   ```

4. **Check DigitalOcean firewall:**
   - Make sure port 5432 is not blocked by DigitalOcean's cloud firewall

5. **View PostgreSQL logs:**
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

6. **Test from server itself:**
   ```bash
   psql -h localhost -U ops -d ops
   ```
   If this works but remote doesn't, it's a firewall/network issue.

---

## After Configuration

Once database access is configured:

1. **Update backend .env file** with correct database credentials
2. **Test backend connection:**
   ```bash
   cd backend
   npm start
   ```
3. **Check health endpoint:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `"database": "connected"`

---

**Security Reminder:** Always use the most restrictive configuration possible. If you know the IP addresses that will connect, specify them explicitly instead of using `0.0.0.0/0`.
