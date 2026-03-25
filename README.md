# Buy Wise — Decision Intelligence SaaS

> **"We Research. You Buy Smart."**

## Project Overview
An AI-powered buying research platform that generates structured product reports for Indian consumers, delivered via WhatsApp PDF.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT + Google OAuth |
| Payments | Razorpay |
| AI Engine | OpenAI GPT-4 Turbo |
| WhatsApp Delivery | WATI API |
| PDF Generation | Puppeteer |
| Price Alerts | Custom DB + WhatsApp |

---

## Project Structure

```
buy-wise/
├── client/              # React (Vite) Frontend
│   └── src/
│       ├── pages/       # All page components
│       ├── components/  # Reusable components
│       └── context/     # React context (auth, etc.)
├── server/              # Node.js + Express Backend
│   ├── routes/          # All API route files
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # JWT auth middleware
│   ├── utils/           # promptBuilder, pdfGenerator
│   ├── config/          # db.js (pg pool)
│   └── schema.sql       # Full PostgreSQL schema
├── .env.example         # All environment variables
└── package.json         # Root convenience scripts
```

---

## Frontend Pages

| Route | Page |
|---|---|
| `/` | Landing Page (Hero, How It Works, Pricing, Why Us) |
| `/order` | Multi-Step Order Form (Tier → Requirements → Payment) |
| `/order/success` | Payment Success + estimated delivery |
| `/dashboard` | User Dashboard (orders + alerts + profile) |
| `/sample` | Sample Report preview with blurred CTA |
| `/deal-watch` | Price Alert management |
| `/feedback/:orderId` | Star-rating feedback form |
| `/admin` | Admin Dashboard (Orders, Analytics, Report Gen) |
| `/contact` | WhatsApp link + email form |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |

---

## Backend API Routes

| Prefix | Endpoints |
|---|---|
| `/api/auth` | register, login, google, me |
| `/api/orders` | create, get by id, get by user, update status |
| `/api/payments` | create Razorpay order, verify webhook |
| `/api/reports` | generate (OpenAI), generate-pdf, send-whatsapp, get |
| `/api/feedback` | submit, get by order |
| `/api/admin` | all orders (filtered), analytics, sync-sheets |
| `/api/alerts` | create, get by user, cancel |

---

## Setup Instructions

### 1. Clone and Install
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Any strong random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay dashboard
- `OPENAI_API_KEY` — OpenAI platform
- `WATI_API_ENDPOINT` / `WATI_API_TOKEN` — WATI dashboard
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google Cloud Console

### 3. Set Up Database
```bash
# Run schema against your PostgreSQL instance
psql -U youruser -d buywise -f server/schema.sql

# Note: Also add password_hash column to users table:
# ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
```

### 4. Run Development Servers
```bash
# Terminal 1 — Frontend
cd client && npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd server && node index.js
# → http://localhost:3000
```

---

## Key Architecture Notes

- **Mock Mode**: The app runs gracefully without API keys. Razorpay, OpenAI, and WATI all have mock/stub fallbacks for development.
- **Scaling Comments**: Level 2 and Level 3 upgrade points are marked in code comments (e.g., `// LEVEL 2 UPGRADE POINT`).
- **Admin Dashboard**: Navigate to `/admin` to access the full order management, AI report generation panel, and analytics chart. Protected by `isAdmin` middleware on API routes.

---

## Deployment

| Layer | Recommended Platform |
|---|---|
| Frontend | Vercel (connect `client/` folder) |
| Backend | Railway or Render |
| Database | Supabase or Railway PostgreSQL |
| PDFs | Supabase Storage or Cloudinary |
