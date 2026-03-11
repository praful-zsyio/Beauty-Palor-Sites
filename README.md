<<<<<<< HEAD
# Beauty-Palor-Sites
=======
# 🌸 Kiran Beauty Salon & Academy

A full-stack web application for **Kiran Beauty Salon & Academy**, Pithampur, Madhya Pradesh.  
Built with **React + Vite** (frontend) and **Node.js + Express + SQLite** (backend), with email powered by **Resend**.

---

## 📁 Project Structure

```
Beauty Pallor Sites/
├── frontend/          # React + Vite client (port 5173)
└── backend/           # Node.js + Express API (port 5000)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### 1 — Start the Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at: `http://localhost:5000`

### 2 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

> ⚠️ **Always start the backend first.** The frontend proxies all `/api/*` requests to `localhost:5000`. If the backend is not running you will see `ECONNREFUSED` proxy errors in the Vite terminal.

---

## ⚙️ Environment Variables

Create / edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=kiran_beauty_jwt_secret_key_2024_super_secure_sqlite
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Resend Email API
RESEND_API_KEY=re_HUUGFXao_PEpKDRr6LCzfD1VRemysUgyg
EMAIL_FROM=onboarding@resend.dev
EMAIL_TO=kiranbeautysalon@gmail.com

# Client URL (used in CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🌐 API Reference

**Base URL:** `http://localhost:5000/api`

All responses follow this structure:
```json
{ "success": true | false, "data": { ... }, "message": "..." }
```

---

### 🔐 Auth  —  `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and get JWT token |
| `GET` | `/api/auth/logout` | 🔒 User | Logout (clears cookie) |
| `GET` | `/api/auth/me` | 🔒 User | Get logged-in user profile |
| `PUT` | `/api/auth/updateprofile` | 🔒 User | Update name / email / phone |
| `PUT` | `/api/auth/updatepassword` | 🔒 User | Change password |

#### Request Bodies

**POST `/api/auth/register`**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "mypassword123",
  "phone": "+91 9876543210"
}
```

**POST `/api/auth/login`**
```json
{
  "email": "priya@example.com",
  "password": "mypassword123"
}
```

**PUT `/api/auth/updatepassword`**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

### 💄 Services  —  `/api/services`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/services` | Public | List all services (with filters) |
| `GET` | `/api/services/categories` | Public | Get all service categories with counts |
| `GET` | `/api/services/:id` | Public | Get a single service by ID |
| `POST` | `/api/services` | 🔒 Admin | Create a new service |
| `PUT` | `/api/services/:id` | 🔒 Admin | Update a service |
| `DELETE` | `/api/services/:id` | 🔒 Admin | Deactivate a service |
| `POST` | `/api/services/:id/reviews` | 🔒 User | Add a review to a service |

#### Query Params — `GET /api/services`

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `Bridal` | Filter by category |
| `featured` | boolean | `true` | Only featured services |
| `popular` | boolean | `true` | Only popular services |
| `search` | string | `facial` | Search in name/description |
| `minPrice` | number | `500` | Minimum price filter |
| `maxPrice` | number | `5000` | Maximum price filter |
| `sort` | string | `price` | Sort field |
| `page` | number | `1` | Page number |
| `limit` | number | `12` | Items per page |

**Examples:**
```
GET /api/services?featured=true&limit=6
GET /api/services?category=Hair&page=1&limit=12
GET /api/services?search=bridal&minPrice=1000
```

---

### 📅 Appointments  —  `/api/appointments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/appointments/slots` | Public | Get available time slots for a date |
| `POST` | `/api/appointments` | 🔒 User | Book a new appointment |
| `GET` | `/api/appointments/my` | 🔒 User | Get my appointments |
| `GET` | `/api/appointments/:id` | 🔒 User | Get a single appointment |
| `PUT` | `/api/appointments/:id/cancel` | 🔒 User | Cancel an appointment |
| `GET` | `/api/appointments/admin/all` | 🔒 Admin/Staff | Get all appointments |
| `PUT` | `/api/appointments/:id/status` | 🔒 Admin/Staff | Update appointment status |

#### Query Params — `GET /api/appointments/slots`

| Param | Required | Description |
|-------|----------|-------------|
| `date` | ✅ Yes | Date in `YYYY-MM-DD` format |
| `serviceId` | No | Filter slots by service |

**Example:**
```
GET /api/appointments/slots?date=2025-03-15
```

#### Request Body — `POST /api/appointments`
```json
{
  "serviceId": 3,
  "date": "2025-03-15",
  "timeSlot": "10:00 AM",
  "customerName": "Priya Sharma",
  "customerEmail": "priya@example.com",
  "customerPhone": "+91 9876543210",
  "notes": "Prefer natural look",
  "specialRequests": "Allergy to certain fragrances",
  "paymentMethod": "cash",
  "staffId": null
}
```

#### Available Time Slots
```
09:00 AM  09:30 AM  10:00 AM  10:30 AM  11:00 AM  11:30 AM
12:00 PM  12:30 PM  01:00 PM  01:30 PM  02:00 PM  02:30 PM
03:00 PM  03:30 PM  04:00 PM  04:30 PM  05:00 PM  05:30 PM
06:00 PM  06:30 PM  07:00 PM
```

#### Appointment Status Values
| Status | Description |
|--------|-------------|
| `pending` | Newly booked |
| `confirmed` | Confirmed by staff |
| `completed` | Service done |
| `cancelled` | Cancelled by user or admin |

---

### 📬 Contact  —  `/api/contact`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/contact` | Public | Send contact form email |

#### Request Body — `POST /api/contact`
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 9876543210",
  "subject": "Appointment Booking",
  "message": "I would like to book a bridal package for March 20th."
}
```

**What happens on submit:**
1. 📧 A formatted HTML email is sent **to the salon** at `kiranbeautysalon@gmail.com`
2. ✅ An **auto-reply confirmation** email is sent to the visitor's email

---

### 🩺 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | Public | Check if API is running |

**Response:**
```json
{
  "success": true,
  "message": "🌸 Kiran Beauty Salon API is running!",
  "database": "SQLite (better-sqlite3)",
  "timestamp": "2025-03-10T17:05:00.000Z",
  "version": "1.0.0"
}
```

---

## 🔑 Authentication

The API uses **JWT tokens** stored in:
- `Authorization: Bearer <token>` header, **OR**
- `token` HTTP-only cookie (set automatically on login/register)

**Roles:**
| Role | Access Level |
|------|-------------|
| `user` | Book appointments, write reviews, manage own profile |
| `staff` | View & update all appointments |
| `admin` | Full access — manage services, all appointments, users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Framer Motion, Zustand, Axios |
| Styling | Vanilla CSS, Google Fonts |
| Router | React Router v7 |
| Backend | Node.js, Express 5 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Email | Resend API |
| Dev Tools | Nodemon, ESLint |

---

## 📍 Salon Information

**Kiran Beauty Salon & Academy**  
Men Corner, Kaka Complex, New Kaka Complex  
Pithampur Industrial Area, Sagour Kuti  
Pithampur, Madhya Pradesh — 454775  

📞 [+91 6265175996](tel:+916265175996)  
🗺️ [Open in Google Maps](https://maps.app.goo.gl/7yBMWFQ7vP62uv)

---

## 📜 License

© 2025 Kiran Beauty Salon & Academy. All rights reserved.
>>>>>>> 7c0bd51 (Initial commit)
