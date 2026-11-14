# Expense Tracker — Full-Stack MERN Application

A full-stack expense tracker built by extending the supplied React/Vite signup screen. The original Firebase placeholder integration has been replaced with a Node.js/Express API, MongoDB/Mongoose persistence, bcrypt password hashing, and JWT-protected routes.

## Features

- Signup and login with server-side validation
- Password hashing with bcrypt
- JWT authentication and protected dashboard
- Create, read, update, and delete income/expense transactions
- Per-user transaction isolation
- Dashboard totals: balance, income, expenses, transaction count
- Filter transactions by income or expense
- Responsive React UI

## Requirements

- Node.js 20.19+ or 22.12+ (recommended for current Vite releases)
- MongoDB local service or MongoDB Atlas database

## 1. Configure MongoDB and backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure it:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=replace_this_with_a_random_secret_at_least_32_characters_long
CLIENT_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string. Keep `.env` private; never commit it to GitHub.

Start the backend:

```bash
npm run dev
```

The API health endpoint is `http://localhost:5000/api/health`.

## 2. Configure and start frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` (the default API URL is already correct for local development):

```env
VITE_API_URL=http://localhost:5000/api
```

Start React/Vite:

```bash
npm run dev
```

Open `http://localhost:5173`.

## 3. Test the application

1. Open the signup page and create an account (password must contain at least 8 characters).
2. You should be redirected to the dashboard.
3. Add an income transaction and an expense transaction.
4. Confirm the summary cards update and the transactions appear.
5. Edit a transaction, then delete one.
6. Log out and log back in. Your transactions should still be present.
7. Create a second account and confirm it cannot see the first account's transactions.

## API endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | API health check |
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/expenses` | Yes | List current user's transactions; optional `?type=income` or `?type=expense` |
| GET | `/expenses/summary` | Yes | Calculate totals for current user |
| POST | `/expenses` | Yes | Create transaction |
| PUT | `/expenses/:id` | Yes | Update owned transaction |
| DELETE | `/expenses/:id` | Yes | Delete owned transaction |

Protected endpoints require `Authorization: Bearer <token>`.

Example expense JSON:

```json
{
  "title": "Monthly salary",
  "amount": 45000,
  "type": "income",
  "category": "Salary",
  "date": "2026-11-14",
  "note": "November salary"
}
```

## Project structure

```text
expense-tracker-fullstack/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/components/
│   ├── src/context/AuthContext.jsx
│   ├── src/pages/
│   ├── src/services/api.js
│   └── src/main.jsx
└── README.md
```

## Security notes

- Passwords are hashed; plaintext passwords are never stored.
- Each expense query is scoped to the authenticated user's ID.
- The JWT secret and database URI belong in environment variables.
- This starter stores the JWT in browser localStorage for straightforward learning/demo use. For a production deployment, consider migrating authentication to Secure, HttpOnly, SameSite cookies and adding CSRF protection, stricter CORS, and deployment-specific rate limits.
