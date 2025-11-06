# Authentication API

Base URL: `http://localhost:5000/api/auth`

Authentication endpoints are **public** for login, but require authentication for `me` and `logout`.

---

## Endpoints

### 1. Login
**POST** `/api/auth/login`

**Description:** Authenticate user and receive JWT token

**Access:** Public (no authentication required)

**Required Fields:**
- `username` (string) - User's username
- `password` (string) - User's password

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "fatihtunali@gmail.com",
    "full_name": "Fatih TUNALI",
    "role": "admin"
  }
}
```

**Error Response - Missing Credentials (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username and password are required"
  }
}
```

**Error Response - Invalid Credentials (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

---

### 2. Get Current User
**GET** `/api/auth/me`

**Description:** Get current authenticated user's information

**Access:** Private (requires authentication)

**Example Request:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "fatihtunali@gmail.com",
    "full_name": "Fatih TUNALI",
    "role": "admin",
    "created_at": "06/11/2025 18:24",
    "last_login": "06/11/2025 20:15"
  }
}
```

**Error Response - No Token (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

**Error Response - Invalid Token (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token"
  }
}
```

---

### 3. Logout
**POST** `/api/auth/logout`

**Description:** Logout user (client-side token removal)

**Access:** Private (requires authentication)

**Note:** JWT tokens are stateless, so logout is handled client-side by removing the token. This endpoint is optional and used for logging purposes.

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove token from client."
}
```

---

## Authentication Flow

### Step 1: Login and Store Token
```javascript
// Login request
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'your_password' })
});

const data = await response.json();

// Store token in localStorage or sessionStorage
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Step 2: Use Token in Requests
```javascript
// Get token from storage
const token = localStorage.getItem('token');

// Use in API requests
const response = await fetch('http://localhost:5000/api/clients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 3: Logout
```javascript
// Remove token from storage
localStorage.removeItem('token');
localStorage.removeItem('user');

// Optional: Call logout endpoint
await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Token Information

- **Type:** JWT (JSON Web Token)
- **Expiration:** 7 days (configurable via JWT_EXPIRE env variable)
- **Algorithm:** HS256
- **Token Payload:**
  ```json
  {
    "userId": 1,
    "username": "admin",
    "role": "admin",
    "iat": 1699308000,
    "exp": 1699912800
  }
  ```

---

## Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Original passwords are never stored in database
- Password comparison is done using bcrypt's secure compare function

---

## User Roles

- `admin` - Full system access
- `staff` - Standard user access
- `accountant` - Financial access

**Note:** Role-based access control is implemented in the authorization middleware.

---

## Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

---

## Security Best Practices

1. **HTTPS Only:** Always use HTTPS in production to protect tokens
2. **Token Storage:** Store tokens in httpOnly cookies or secure storage
3. **Token Refresh:** Implement token refresh for better security
4. **Rate Limiting:** Implement rate limiting on login endpoint
5. **Password Requirements:** Enforce strong password policies
6. **Account Lockout:** Lock accounts after multiple failed login attempts

---

## Error Codes

- `VALIDATION_ERROR` (400) - Missing username or password
- `INVALID_CREDENTIALS` (401) - Wrong username or password
- `UNAUTHORIZED` (401) - No token or invalid token
- `NOT_FOUND` (404) - User not found
- `INTERNAL_ERROR` (500) - Server error

---

**Last Updated:** 2025-12-06
