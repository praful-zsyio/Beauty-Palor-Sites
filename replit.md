# Kiran Beauty Salon & Academy

A full-stack web application for Kiran Beauty Salon & Academy, featuring appointment booking, services browsing, admin dashboard, and a chatbot.

## Architecture

- **Frontend**: React 19 + Vite + TailwindCSS (port 5000 in dev)
- **Backend**: Node.js + Express (port 3001 in dev)
- **Database**: SQLite via `better-sqlite3` (`backend/data/kiran_beauty.db`)

## Project Structure

```
/
├── frontend/          # React + Vite frontend (port 5000)
│   ├── src/
│   │   ├── pages/     # Route-level page components
│   │   ├── components/ # Reusable UI components
│   │   └── store/     # Zustand state management
│   └── vite.config.js # Vite config (proxies /api → localhost:3001)
└── backend/           # Express API (port 3001)
    ├── controllers/   # Route handler logic
    ├── models/        # SQLite data models
    ├── routes/        # Express route definitions
    ├── middleware/    # Auth, error handling
    ├── config/db.js   # SQLite connection + schema
    └── data/          # SQLite database file
```

## Workflows

- **Start application** (webview, port 5000): `cd frontend && npm run dev`
- **Backend API** (console, port 3001): `cd backend && node server.js`

## Key Features

- Service browsing and booking
- User authentication (JWT)
- Admin dashboard with appointment management
- AI Chatbot integration
- Email notifications via Resend (optional, requires `RESEND_API_KEY`)
- Google Sheets sync (optional, requires Google credentials)

## Environment Variables

- `JWT_SECRET` - Secret for JWT tokens (defaults to temp value in dev)
- `RESEND_API_KEY` - Resend email service API key (optional)
- `NODE_ENV` - Environment mode

## Deployment

Configured for autoscale deployment:
- **Build**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- **Run**: `cd backend && node server.js`
