# Client Management API

Base URL: `http://localhost:5000/api/clients`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Clients
**GET** `/api/clients`

**Description:** List all clients with optional filters

**Query Parameters:**
- `type` (optional) - Filter by client type: `agent` or `direct`
- `status` (optional) - Filter by status: `active` or `inactive`
- `search` (optional) - Search by client name (case-insensitive)

**Example Request:**
```bash
curl http://localhost:5000/api/clients?type=agent&status=active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_code": "CL001",
      "name": "ABC Travel Agency",
      "type": "agent",
      "email": "info@abctravel.com",
      "phone": "+90 555 1234567",
      "address": "Istanbul, Turkey",
      "commission_rate": 15.00,
      "notes": "VIP client",
      "created_at": "06/11/2025 18:24",
      "status": "active"
    }
  ],
  "count": 1
}
```

---

### 2. Get Single Client
**GET** `/api/clients/:id`

**Description:** Get a specific client by ID

**Example Request:**
```bash
curl http://localhost:5000/api/clients/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "client_code": "CL001",
    "name": "ABC Travel Agency",
    "type": "agent",
    "email": "info@abctravel.com",
    "phone": "+90 555 1234567",
    "address": "Istanbul, Turkey",
    "commission_rate": 15.00,
    "notes": "VIP client",
    "created_at": "06/11/2025 18:24",
    "status": "active"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found"
  }
}
```

---

### 3. Create Client
**POST** `/api/clients`

**Description:** Create a new client

**Required Fields:**
- `name` (string) - Client name
- `type` (string) - Must be either `agent` or `direct`

**Optional Fields:**
- `client_code` (string) - Unique client code
- `email` (string) - Email address
- `phone` (string) - Phone number
- `address` (string) - Physical address
- `commission_rate` (decimal) - Commission rate for agents (0-100)
- `notes` (string) - Additional notes
- `status` (string) - Status: `active` or `inactive` (default: `active`)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ABC Travel Agency",
    "type": "agent",
    "email": "info@abctravel.com",
    "phone": "+90 555 1234567",
    "address": "Istanbul, Turkey",
    "commission_rate": 15.00,
    "notes": "VIP client"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": 1,
    "client_code": null,
    "name": "ABC Travel Agency",
    "type": "agent",
    "email": "info@abctravel.com",
    "phone": "+90 555 1234567",
    "address": "Istanbul, Turkey",
    "commission_rate": 15.00,
    "notes": "VIP client",
    "created_at": "06/11/2025 18:24",
    "status": "active"
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name and type are required"
  }
}
```

---

### 4. Update Client
**PUT** `/api/clients/:id`

**Description:** Update an existing client

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/clients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "commission_rate": 20.00,
    "notes": "Premium VIP client"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "id": 1,
    "client_code": "CL001",
    "name": "ABC Travel Agency",
    "type": "agent",
    "email": "info@abctravel.com",
    "phone": "+90 555 1234567",
    "address": "Istanbul, Turkey",
    "commission_rate": 20.00,
    "notes": "Premium VIP client",
    "created_at": "06/11/2025 18:24",
    "status": "active"
  }
}
```

---

### 5. Delete Client (Soft Delete)
**DELETE** `/api/clients/:id`

**Description:** Soft delete a client (sets status to 'inactive')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/clients/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

## Database Schema

```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    client_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'agent' or 'direct'
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    commission_rate DECIMAL(5,2), -- for agents only (e.g., 15.00 = 15%)
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    CONSTRAINT chk_client_type CHECK (type IN ('agent', 'direct'))
);
```

---

## Field Validations

- **name:** Required, max 255 characters
- **type:** Required, must be either 'agent' or 'direct'
- **client_code:** Optional, must be unique if provided
- **email:** Optional, valid email format
- **commission_rate:** Optional, must be between 0 and 100 for agents
- **status:** Must be either 'active' or 'inactive'

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Client not found
- `DUPLICATE_ERROR` (409) - Client code already exists
- `INTERNAL_ERROR` (500) - Server error

---

**Last Updated:** 2025-12-06
