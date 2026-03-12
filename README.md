# Splitwise MVP — Backend API

A REST API backend that replicates core Splitwise functionality — track shared expenses and automatically calculate who owes whom.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** MySQL

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v16+
- MySQL installed and running

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/splitwise-mvp.git
cd splitwise-mvp
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Create MySQL Database
```sql
CREATE DATABASE splitwise_db;
```

### Step 4 — Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=splitwise_db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### Step 5 — Start the Server
```bash
npm run dev
```

You should see:
```
Database connected successfully
All tables synced successfully
Server running on port 3000
```

---

## 🗄️ Database Schema

```
users
├── id (PK)
├── email (unique)
├── password (hashed)
├── default_currency
├── createdAt
└── updatedAt

expenses
├── id (PK)
├── name
├── value
├── currency
├── date
├── created_by (FK → users.id)
├── createdAt
└── updatedAt

expense_members
├── id (PK)
├── expense_id (FK → expenses.id)
├── user_id (FK → users.id)
├── share_amount
├── createdAt
└── updatedAt

balances
├── id (PK)
├── user_id (FK → users.id)       ← person who OWES
├── owes_user_id (FK → users.id)  ← person who is OWED
├── amount
├── currency
├── createdAt
└── updatedAt
```

---

## 📌 Base URL

```
http://localhost:3000/api
```

---

## 📋 API Reference

---

## 👤 User APIs

---

### 1. Create User

**POST** `/api/users`

Creates a new user account.

**Request Body:**
```json
{
  "email": "sudarshan@gmail.com",
  "password": "pass123",
  "default_currency": "INR"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Unique email address |
| password | string | ✅ | Min 6 characters |
| default_currency | string | ❌ | Default: "INR" |

**Success Response — 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "sudarshan@gmail.com",
    "default_currency": "INR",
    "createdAt": "2026-03-13T10:00:00.000Z",
    "updatedAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Error Response — 400:**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

### 2. Get User

**GET** `/api/users/:id`

Fetch a user's profile by ID.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | integer | User ID |

**Example Request:**
```
GET http://localhost:3000/api/users/1
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "sudarshan@gmail.com",
    "default_currency": "INR",
    "createdAt": "2026-03-13T10:00:00.000Z",
    "updatedAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Error Response — 404:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Update User

**PUT** `/api/users/:id`

Update a user's email or currency.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| id | integer | User ID |

**Request Body (all fields optional):**
```json
{
  "email": "newemail@gmail.com",
  "default_currency": "USD"
}
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "newemail@gmail.com",
    "default_currency": "USD",
    "updatedAt": "2026-03-13T11:00:00.000Z"
  }
}
```

**Error Responses:**
```json
{ "success": false, "message": "User not found" }
{ "success": false, "message": "Email already in use" }
```

---

### 4. Delete User

**DELETE** `/api/users/:id`

Permanently delete a user account. Also deletes all related expense memberships and balances.

**Example Request:**
```
DELETE http://localhost:3000/api/users/1
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Error Response — 404:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 💸 Expense APIs

---

### 5. Create Expense

**POST** `/api/expenses`

Add a new expense and automatically split it equally among members. Balances are updated automatically.

**Request Body:**
```json
{
  "name": "Dinner",
  "value": 900,
  "currency": "INR",
  "date": "2026-03-11",
  "userId": 1,
  "members": [1, 2, 3]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Expense name |
| value | number | ✅ | Total amount |
| currency | string | ✅ | Currency code e.g. "INR" |
| date | string | ✅ | Format: YYYY-MM-DD |
| userId | integer | ✅ | ID of user who paid |
| members | array | ✅ | Array of user IDs splitting the bill. Must include userId |

> **Note:** Amount is split **equally** among all members.
> `userId` (the payer) **must** be included in the `members` array.

**Success Response — 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dinner",
    "value": "900.00",
    "currency": "INR",
    "date": "2026-03-11",
    "created_by": 1,
    "members": [
      { "user_id": 1, "share_amount": "300.00" },
      { "user_id": 2, "share_amount": "300.00" },
      { "user_id": 3, "share_amount": "300.00" }
    ],
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Error Responses:**
```json
{ "success": false, "message": "Creator must be included in members" }
{ "success": false, "message": "User with id 999 not found" }
```

---

### 6. Get Expense

**GET** `/api/expenses/:id`

Fetch a single expense with full details including creator and members.

**Example Request:**
```
GET http://localhost:3000/api/expenses/1
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dinner",
    "value": "900.00",
    "currency": "INR",
    "date": "2026-03-11",
    "created_by": 1,
    "creator": {
      "id": 1,
      "email": "sudarshan@gmail.com"
    },
    "members": [
      {
        "user_id": 1,
        "share_amount": "300.00",
        "user": { "id": 1, "email": "sudarshan@gmail.com" }
      },
      {
        "user_id": 2,
        "share_amount": "300.00",
        "user": { "id": 2, "email": "rahul@gmail.com" }
      },
      {
        "user_id": 3,
        "share_amount": "300.00",
        "user": { "id": 3, "email": "priya@gmail.com" }
      }
    ],
    "createdAt": "2026-03-13T10:00:00.000Z",
    "updatedAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Error Response — 404:**
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

### 7. Update Expense

**PUT** `/api/expenses/:id`

Update an expense. Old balances are automatically reversed and new balances recalculated.

**Request Body (all fields optional):**
```json
{
  "name": "Team Dinner",
  "value": 1200,
  "currency": "INR",
  "date": "2026-03-11",
  "members": [1, 2, 3]
}
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Team Dinner",
    "value": "1200.00",
    "currency": "INR",
    "date": "2026-03-11",
    "created_by": 1,
    "members": [
      { "user_id": 1, "share_amount": "400.00" },
      { "user_id": 2, "share_amount": "400.00" },
      { "user_id": 3, "share_amount": "400.00" }
    ],
    "updatedAt": "2026-03-13T11:00:00.000Z"
  }
}
```

**Error Response — 404:**
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

### 8. Delete Expense

**DELETE** `/api/expenses/:id`

Delete an expense. Balances are automatically reversed.

**Example Request:**
```
DELETE http://localhost:3000/api/expenses/1
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "message": "Expense deleted successfully"
  }
}
```

**Error Response — 404:**
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

### 9. Get Activity Log

**GET** `/api/expenses/activity`

View all expenses a user is part of, grouped by month.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | integer | ✅ | User whose activity to fetch |
| filter | string | ✅ | `this_month` / `last_month` / `custom` |
| startDate | string | Only for `custom` | Format: YYYY-MM-DD |
| endDate | string | Only for `custom` | Format: YYYY-MM-DD |

**Example Requests:**

```
# This month
GET http://localhost:3000/api/expenses/activity?userId=1&filter=this_month

# Last month
GET http://localhost:3000/api/expenses/activity?userId=1&filter=last_month

# Custom date range
GET http://localhost:3000/api/expenses/activity?userId=1&filter=custom&startDate=2026-01-01&endDate=2026-03-31
```

**Success Response — 200:**
```json
{
  "success": true,
  "data": {
    "March 2026": [
      {
        "id": 1,
        "name": "Dinner",
        "value": "900.00",
        "currency": "INR",
        "date": "2026-03-11",
        "creator": { "id": 1, "email": "sudarshan@gmail.com" },
        "members": [
          { "user_id": 1, "share_amount": "300.00" },
          { "user_id": 2, "share_amount": "300.00" },
          { "user_id": 3, "share_amount": "300.00" }
        ]
      },
      {
        "id": 2,
        "name": "Cab",
        "value": "600.00",
        "currency": "INR",
        "date": "2026-03-11",
        "creator": { "id": 2, "email": "rahul@gmail.com" },
        "members": [
          { "user_id": 1, "share_amount": "200.00" },
          { "user_id": 2, "share_amount": "200.00" },
          { "user_id": 3, "share_amount": "200.00" }
        ]
      }
    ],
    "February 2026": [
      {
        "id": 3,
        "name": "Groceries",
        "value": "300.00",
        "currency": "INR",
        "date": "2026-02-15",
        "creator": { "id": 3, "email": "priya@gmail.com" },
        "members": [
          { "user_id": 1, "share_amount": "150.00" },
          { "user_id": 3, "share_amount": "150.00" }
        ]
      }
    ]
  }
}
```

**Empty Response (no expenses in range):**
```json
{
  "success": true,
  "data": {}
}
```

---

## ⚖️ Balance APIs

---

### 10. Get User Balances

**GET** `/api/balances/:userId`

View all balances for a user — who owes them and who they owe.

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| userId | integer | User ID |

**Example Request:**
```
GET http://localhost:3000/api/balances/1
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| direction: `owes_you` | The other person owes YOU money |
| direction: `you_owe` | YOU owe the other person money |

**Success Response — 200:**
```json
{
  "success": true,
  "data": [
    {
      "balanceId": 1,
      "withUserId": 2,
      "withUserEmail": "rahul@gmail.com",
      "amount": "100.00",
      "currency": "INR",
      "direction": "owes_you"
    },
    {
      "balanceId": 2,
      "withUserId": 3,
      "withUserEmail": "priya@gmail.com",
      "amount": "300.00",
      "currency": "INR",
      "direction": "owes_you"
    },
    {
      "balanceId": 3,
      "withUserId": 3,
      "withUserEmail": "priya@gmail.com",
      "amount": "150.00",
      "currency": "INR",
      "direction": "you_owe"
    }
  ]
}
```

**Empty Response (no balances):**
```json
{
  "success": true,
  "data": []
}
```

---

## 🔴 Global Error Responses

| Status | Message | When |
|--------|---------|------|
| 400 | "Email already in use" | Duplicate email on create/update |
| 400 | "Creator must be included in members" | userId not in members array |
| 400 | "User with id X not found" | Invalid member ID in expense |
| 404 | "User not found" | User ID doesn't exist |
| 404 | "Expense not found" | Expense ID doesn't exist |
| 404 | "Route not found" | Invalid endpoint |
| 500 | "Internal Server Error" | Unexpected server error |

---

## 📊 Quick Reference

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | `/api/users` | Create user |
| 2 | GET | `/api/users/:id` | Get user profile |
| 3 | PUT | `/api/users/:id` | Update user |
| 4 | DELETE | `/api/users/:id` | Delete user |
| 5 | POST | `/api/expenses` | Create expense |
| 6 | GET | `/api/expenses/:id` | Get expense |
| 7 | PUT | `/api/expenses/:id` | Update expense |
| 8 | DELETE | `/api/expenses/:id` | Delete expense |
| 9 | GET | `/api/expenses/activity` | Activity log |
| 10 | GET | `/api/balances/:userId` | Get user balances |

---

## 🧪 Testing Flow (Recommended Order)

Follow this order in Postman to test everything correctly:

```
Step 1:  POST /api/users          → Create User 1 (Sudarshan)
Step 2:  POST /api/users          → Create User 2 (Rahul)
Step 3:  POST /api/users          → Create User 3 (Priya)
Step 4:  GET  /api/users/1        → Verify User 1
Step 5:  PUT  /api/users/1        → Update currency to USD
Step 6:  POST /api/expenses       → Dinner ₹900 (userId:1, members:[1,2,3])
Step 7:  POST /api/expenses       → Cab ₹600 (userId:2, members:[1,2,3])
Step 8:  POST /api/expenses       → Groceries ₹300 (userId:3, members:[1,3]) date: last month
Step 9:  GET  /api/expenses/1     → Verify Dinner expense
Step 10: GET  /api/expenses/activity?userId=1&filter=this_month
Step 11: GET  /api/expenses/activity?userId=1&filter=last_month
Step 12: GET  /api/expenses/activity?userId=1&filter=custom&startDate=2026-01-01&endDate=2026-03-31
Step 13: GET  /api/balances/1     → Sudarshan's balances
Step 14: GET  /api/balances/2     → Rahul's balances
Step 15: PUT  /api/expenses/1     → Update Dinner to ₹1200
Step 16: GET  /api/balances/1     → Verify balances changed
Step 17: DELETE /api/expenses/2   → Delete Cab expense
Step 18: GET  /api/balances/1     → Verify balances reversed
Step 19: DELETE /api/users/3      → Delete Priya
Step 20: GET  /api/users/3        → Should return 404
```

---

## 📝 Assumptions

- Expenses are split **equally** among all members
- No authentication layer — `userId` is passed directly in request body or query params
- Balances are automatically updated when an expense is created, updated, or deleted
- When a user is deleted, all their expense memberships and balances are cascade deleted
- All monetary values are stored with 2 decimal places

---

## 👨‍💻 Author

**Sudarshan Rawate**
