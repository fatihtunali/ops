# Users API Documentation

Base URL: `/api/users`

**Authentication Required:** Yes (Admin only)

---

## Endpoints

### GET /api/users

Get all users

**Query Parameters:**
- `role` (optional): Filter by role (admin, staff, accountant)
- `status` (optional): Filter by status (active, inactive)
- `search` (optional): Search by username, email, or full name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@funnytourism.com",
      "full_name": "System Administrator",
      "role": "admin",
      "is_active": true,
      "created_at": "2025-12-06T10:00:00.000Z",
      "last_login": "2025-12-07T09:00:00.000Z"
    }
  ]
}
```

---

### GET /api/users/:id

Get user by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@funnytourism.com",
    "full_name": "System Administrator",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-12-06T10:00:00.000Z",
    "last_login": "2025-12-07T09:00:00.000Z"
  }
}
```

---

### POST /api/users

Create new user

**Request Body:**
```json
{
  "username": "staff1",
  "email": "staff1@funnytourism.com",
  "password": "password123",
  "full_name": "Staff Member",
  "role": "staff"
}
```

**Valid Roles:**
- `admin` - Full system access
- `staff` - Booking and client management
- `accountant` - Payment and financial reports

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@funnytourism.com",
    "full_name": "Staff Member",
    "role": "staff",
    "is_active": true,
    "created_at": "2025-12-07T10:00:00.000Z"
  }
}
```

---

### PUT /api/users/:id

Update user details

**Request Body:**
```json
{
  "username": "staff1_updated",
  "email": "staff1.new@funnytourism.com",
  "full_name": "Updated Staff Member",
  "role": "accountant",
  "is_active": true
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "username": "staff1_updated",
    "email": "staff1.new@funnytourism.com",
    "full_name": "Updated Staff Member",
    "role": "accountant",
    "is_active": true,
    "created_at": "2025-12-07T10:00:00.000Z",
    "last_login": null
  }
}
```

---

### PUT /api/users/:id/password

Update user password

**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### DELETE /api/users/:id

Deactivate user (soft delete)

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Note:** This does not delete the user from the database, it just sets `is_active = false`.

---

### PUT /api/users/:id/activate

Activate user

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username, email, password, and full_name are required"
  }
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Current password is incorrect"
  }
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. Required roles: admin"
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Username or email already exists"
  }
}
```

---

## Usage Examples

### cURL Examples

**Get all active staff users:**
```bash
curl -X GET "http://localhost:5000/api/users?role=staff&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create new user:**
```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff2",
    "email": "staff2@funnytourism.com",
    "password": "password123",
    "full_name": "Second Staff Member",
    "role": "staff"
  }'
```

**Update user password:**
```bash
curl -X PUT "http://localhost:5000/api/users/2/password" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "old_password",
    "new_password": "new_password123"
  }'
```

**Deactivate user:**
```bash
curl -X DELETE "http://localhost:5000/api/users/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Last Updated:** 2025-11-07
