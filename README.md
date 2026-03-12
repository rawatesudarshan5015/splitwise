# Splitwise MVP API

## Tech Stack
- Node.js + Express
- Sequelize ORM
- MySQL

## Setup & Installation
Step by step instructions:
- Clone repo
- `npm install`
- Create `.env` file (use the template below)
- Create MySQL database in your SQL client: `CREATE DATABASE splitwise_db;`
- `npm run dev`

### `.env` Template
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=splitwise_db
DB_USER=root
DB_PASSWORD=your_password
```

## API Endpoints

### Users
- `POST   /api/users`          - Create user
- `GET    /api/users/:id`      - Get user
- `PUT    /api/users/:id`      - Update user
- `DELETE /api/users/:id`      - Delete user

### Expenses
- `POST   /api/expenses`               - Create expense
- `GET    /api/expenses/:id`           - Get expense
- `PUT    /api/expenses/:id`           - Update expense
- `DELETE /api/expenses/:id`           - Delete expense
- `GET    /api/expenses/activity`      - Activity log

### Balances
- `GET    /api/balances/:userId`       - Get user balances

## Request Body Examples

### Create User (`POST /api/users`)
```json
{
  "email": "sudarshan@gmail.com",
  "password": "pass123",
  "default_currency": "INR"
}
```

### Create Expense (`POST /api/expenses`)
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

## Assumptions
- Equal split among all members
- No auth layer: `userId` is passed in request body/query
- Balances auto-update on expense create/update/delete
- All amounts stored in 2 decimal places
