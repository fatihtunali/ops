# Agent/Tour Operator Billing System - User Guide

## Overview

The booking system supports two types of bookings:
1. **Direct Bookings**: Where the customer books and pays directly
2. **Agent Bookings**: Where a tour operator/agent books on behalf of a traveler and the agent is billed

## Key Concepts

### WHO PAYS vs WHO TRAVELS

- **WHO PAYS (Billed To)**: The client in the `clients` table linked via `client_id`. This is the tour operator/agent who will be invoiced.
- **WHO TRAVELS (Traveler)**: The actual passenger stored in `traveler_name`, `traveler_email`, `traveler_phone` fields in the bookings table.

### Database Structure

**Clients Table:**
- `id`: Primary key
- `name`: Client/Agent name
- `type`: 'agent' or 'direct'
- `email`, `phone`: Contact information
- `commission_rate`: For agents (optional)

**Bookings Table:**
- `client_id`: References the client (who pays the bill)
- `booked_by`: 'agent' or 'direct' (auto-populated from client.type)
- `traveler_name`: Actual passenger name
- `traveler_email`: Actual passenger email
- `traveler_phone`: Actual passenger phone

## How to Use

### Step 1: Set Up Agent Clients

Before creating agent bookings, you need to mark clients as agents:

1. Go to **Clients Management** page
2. Click **Add Client** or edit an existing client
3. Set **Client Type** to "Travel Agent"
4. Optionally add a commission rate (e.g., 15%)
5. Save the client

### Step 2: Create an Agent Booking

1. Go to **Create Booking** page
2. **Select Client**: Choose an agent client from the dropdown
   - You'll see "(Agent)" label next to agent names
   - You'll see "(Direct)" label next to direct customers

3. **When an Agent is Selected:**
   - The form automatically shows a **yellow/amber section** for "Traveler Information"
   - This section asks for the actual passenger's details
   - Fill in:
     - Traveler Name (required)
     - Traveler Email (optional)
     - Traveler Phone (optional)

4. **Complete the rest of the booking:**
   - Travel dates
   - PAX count
   - Services (hotels, tours, transfers, flights)
   - Notes

5. **Submit the booking**

### Step 3: Understanding the Booking Display

When viewing a booking:

**For Agent Bookings:**
- **Billed To** section (blue background): Shows the agent/tour operator who will be invoiced
  - Displays agent name, email, phone
  - Shows "Agent" badge
- **Traveler (Passenger)** section (amber background): Shows the actual passenger
  - Displays traveler name, email, phone

**For Direct Bookings:**
- **Billed To** section: Shows the customer
  - Shows "Direct" badge
- **Traveler (Passenger)** section: Shows same information as "Billed To"
  - Displays message: "Direct booking - client and traveler are the same"

## System Behavior

### Automatic Logic

1. **When selecting a client:**
   - System reads `client.type` from the database
   - Sets `bookingData.booked_by` to match the client type
   - For direct clients: Auto-fills traveler info with client info
   - For agent clients: Shows empty traveler fields for manual entry

2. **Validation:**
   - For agent bookings: `traveler_name` is required
   - For direct bookings: Traveler fields are optional (auto-filled)

3. **Billing:**
   - `client_id` always points to who pays (the agent or direct customer)
   - Invoices and payment records link to `client_id`
   - Agent commission (if set) can be applied when calculating final prices

## Reporting & Finance

### Outstanding Receivables
- The `client_id` field determines who owes money
- For agent bookings: The agent's account shows the outstanding balance
- View in: Finance > Receivables

### Booking Lists
- Filter by booking type: "Agent" or "Direct"
- Agent bookings show both agent name and traveler name
- Use the "Type" column to see booking type at a glance

## Technical Details

### API Fields

**Creating/Updating Bookings:**
```javascript
{
  client_id: 123,              // Required: Who pays
  booked_by: 'agent',          // Auto-set from client.type
  traveler_name: 'John Doe',   // Required for agents
  traveler_email: 'john@...',  // Optional
  traveler_phone: '+1234...',  // Optional
  // ... other booking fields
}
```

### Backend Validation
- `booked_by` must be 'agent' or 'direct'
- `client_id` must reference an existing client
- Backend accepts and stores all traveler fields

## Common Scenarios

### Scenario 1: Tour Operator with Multiple Travelers
- Create ONE client record for the tour operator (type: agent)
- Create separate bookings for each traveler
- Each booking:
  - Links to the same `client_id` (tour operator)
  - Has different `traveler_name` for each passenger
  - Tour operator receives one consolidated invoice

### Scenario 2: Direct Customer
- Create client record (type: direct)
- Create booking and select the direct client
- Traveler fields auto-populate
- Customer pays directly

### Scenario 3: Agent Commission
- Set commission_rate on agent client (e.g., 15%)
- When pricing services, factor in the commission
- Final invoice to agent reflects commission discount
- System tracks gross profit after commission

## Troubleshooting

### Agent Dropdown Doesn't Show Agent Label
- **Fixed in this update**: Changed `client.client_type` to `client.type`
- Dropdown now correctly shows "(Agent)" or "(Direct)" labels

### Traveler Section Doesn't Appear
- Check that the selected client has `type = 'agent'` in the database
- The traveler section only shows for agent-type clients

### Billing Goes to Wrong Person
- Verify `client_id` points to who should pay
- For agent bookings: `client_id` = agent, not the traveler
- Check the "Billed To" section in booking details

## Summary

The system is designed to clearly separate:
1. **Who pays the bill**: Stored in `clients` table, referenced by `client_id`
2. **Who travels**: Stored in `traveler_*` fields in `bookings` table

This allows tour operators/agents to book on behalf of their customers while maintaining clear billing records.

---

**Last Updated**: 2025-11-09
**System Version**: 1.0
