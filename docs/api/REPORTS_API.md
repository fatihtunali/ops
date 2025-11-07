# Reports API Documentation

Base URL: `/api/reports`

**Authentication Required:** Yes

---

## Financial Reports

### GET /api/reports/monthly-pl

Get monthly Profit & Loss report

**Query Parameters:**
- `month` (required): Format YYYY-MM (e.g., 2025-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2025-12",
    "revenue": {
      "total_bookings_revenue": 42000.00,
      "booking_count": 28
    },
    "direct_costs": {
      "hotel_costs": 18000.00,
      "tour_costs": 8000.00,
      "transfer_costs": 3000.00,
      "flight_costs": 2500.00,
      "total": 31500.00
    },
    "gross_profit": 10500.00,
    "operational_expenses": {
      "rent": 2000.00,
      "salaries": 5000.00,
      "utilities": 300.00,
      "marketing": 500.00,
      "other": 200.00,
      "total": 8000.00
    },
    "net_profit": 2500.00
  }
}
```

---

### GET /api/reports/booking-profitability/:bookingId

Get profitability breakdown for specific booking

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_code": "Funny-1046",
    "client_name": "ABC Travel Agency",
    "travel_dates": {
      "from": "2025-12-10",
      "to": "2025-12-15"
    },
    "services": {
      "hotels": [
        {
          "name": "Hilton Istanbul",
          "date": "2025-12-10",
          "cost_price": 300.00,
          "sell_price": 400.00,
          "margin": 100.00
        }
      ],
      "tours": [
        {
          "name": "Cappadocia Hot Air Balloon",
          "date": "2025-12-11",
          "cost_price": 280.00,
          "sell_price": 450.00,
          "margin": 170.00
        }
      ],
      "transfers": [],
      "flights": []
    },
    "totals": {
      "total_cost_price": 580.00,
      "total_sell_price": 850.00,
      "gross_profit": 270.00,
      "margin_percentage": "31.76"
    },
    "payment_info": {
      "payment_status": "partial",
      "amount_received": 425.00,
      "outstanding": 425.00
    }
  }
}
```

---

### GET /api/reports/cash-flow

Get cash flow report (money in vs money out)

**Query Parameters:**
- `from_date` (required): Format YYYY-MM-DD
- `to_date` (required): Format YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-12-01",
      "to": "2025-12-31"
    },
    "summary": {
      "total_money_in": 42000.00,
      "total_money_out": 35000.00,
      "net_cash_flow": 7000.00
    },
    "money_in": {
      "total": 42000.00,
      "count": 45,
      "transactions": [
        {
          "date": "2025-12-07",
          "amount": 500.00,
          "booking_code": "Funny-1046",
          "client_name": "ABC Travel",
          "payment_method": "bank_transfer"
        }
      ]
    },
    "money_out": {
      "total": 35000.00,
      "supplier_payments": {
        "total": 28000.00,
        "count": 32,
        "transactions": [
          {
            "date": "2025-12-05",
            "amount": 300.00,
            "supplier_name": "Hilton Istanbul",
            "supplier_type": "hotel",
            "booking_code": "Funny-1046",
            "payment_method": "bank_transfer"
          }
        ]
      },
      "operational_expenses": {
        "total": 7000.00,
        "count": 15,
        "transactions": [
          {
            "date": "2025-12-01",
            "amount": 2000.00,
            "category": "rent",
            "description": "Office rent",
            "payment_method": "bank_transfer"
          }
        ]
      }
    }
  }
}
```

---

### GET /api/reports/sales-by-client

Get sales performance by client

**Query Parameters:**
- `from_date` (optional): Format YYYY-MM-DD
- `to_date` (optional): Format YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-12-01",
      "to": "2025-12-31"
    },
    "clients": [
      {
        "client_id": 1,
        "client_name": "ABC Travel Agency",
        "client_type": "agent",
        "booking_count": 15,
        "total_revenue": 25000.00,
        "total_costs": 18000.00,
        "total_profit": 7000.00,
        "avg_booking_value": 1666.67,
        "profit_margin_percentage": "28.00"
      }
    ]
  }
}
```

---

### GET /api/reports/sales-by-service

Get sales breakdown by service type

**Query Parameters:**
- `from_date` (optional): Format YYYY-MM-DD
- `to_date` (optional): Format YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-12-01",
      "to": "2025-12-31"
    },
    "services": [
      {
        "service_type": "hotels",
        "service_count": 45,
        "total_cost": 18000.00,
        "total_revenue": 24000.00,
        "total_profit": 6000.00,
        "profit_margin_percentage": "25.00"
      },
      {
        "service_type": "tours",
        "service_count": 38,
        "total_cost": 8000.00,
        "total_revenue": 12000.00,
        "total_profit": 4000.00,
        "profit_margin_percentage": "33.33"
      }
    ]
  }
}
```

---

### GET /api/reports/outstanding

Get outstanding receivables and payables

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_receivables": 8500.00,
      "total_payables": 3200.00,
      "net_position": 5300.00
    },
    "receivables": {
      "total": 8500.00,
      "count": 5,
      "items": [
        {
          "booking_code": "Funny-1046",
          "client_name": "ABC Travel",
          "total_amount": 2500.00,
          "amount_received": 1250.00,
          "outstanding_amount": 1250.00,
          "payment_status": "partial",
          "confirmed_at": "2025-12-01",
          "days_outstanding": 6
        }
      ]
    },
    "payables": {
      "total": 3200.00,
      "count": 8,
      "items": [
        {
          "booking_code": "Funny-1047",
          "supplier_name": "Hilton Istanbul",
          "supplier_type": "hotel",
          "amount": 800.00,
          "due_date": "2025-12-05",
          "status": "pending",
          "days_overdue": 2
        }
      ]
    }
  }
}
```

---

### GET /api/reports/dashboard-stats

Get dashboard statistics (KPIs, upcoming departures, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "active_inquiries": 12,
    "this_month": {
      "confirmed_bookings": 8,
      "revenue": 24500.00,
      "gross_profit": 6200.00
    },
    "outstanding": {
      "receivables": 3200.00,
      "payables": 1800.00
    },
    "upcoming_departures": [
      {
        "booking_code": "Funny-1046",
        "client_name": "ABC Travel",
        "departure_date": "2025-12-08",
        "pax_count": 2
      },
      {
        "booking_code": "Funny-1048",
        "client_name": "XYZ Tours",
        "departure_date": "2025-12-10",
        "pax_count": 4
      }
    ]
  }
}
```

---

## Excel Export Endpoints

### POST /api/reports/export/monthly-pl

Export monthly P&L report to Excel

**Request Body:**
```json
{
  "month": "2025-12"
}
```

**Response:**
Downloads Excel file `monthly_pl_2025-12.xlsx`

---

### POST /api/reports/export/cash-flow

Export cash flow report to Excel

**Request Body:**
```json
{
  "from_date": "2025-12-01",
  "to_date": "2025-12-31"
}
```

**Response:**
Downloads Excel file `cash_flow_2025-12-01_2025-12-31.xlsx`

---

### POST /api/reports/export/sales-by-client

Export sales by client to Excel

**Request Body:**
```json
{
  "from_date": "2025-12-01",
  "to_date": "2025-12-31"
}
```

**Response:**
Downloads Excel file `sales_by_client.xlsx`

---

### POST /api/reports/export/outstanding

Export outstanding payments to Excel

**Request Body:** (none)

**Response:**
Downloads Excel file `outstanding_payments.xlsx`

---

## Usage Examples

### cURL Examples

**Get monthly P&L:**
```bash
curl -X GET "http://localhost:5000/api/reports/monthly-pl?month=2025-12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get cash flow report:**
```bash
curl -X GET "http://localhost:5000/api/reports/cash-flow?from_date=2025-12-01&to_date=2025-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Export monthly P&L to Excel:**
```bash
curl -X POST "http://localhost:5000/api/reports/export/monthly-pl" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"month": "2025-12"}' \
  --output monthly_pl.xlsx
```

**Get dashboard stats:**
```bash
curl -X GET "http://localhost:5000/api/reports/dashboard-stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Month parameter is required (format: YYYY-MM)"
  }
}
```

### 500 - Internal Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to generate monthly P&L report",
    "details": "Error message details"
  }
}
```

---

**Last Updated:** 2025-11-07
