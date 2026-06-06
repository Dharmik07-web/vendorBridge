<<<<<<< HEAD
# VendorBridge — Procurement & Vendor Management ERP

> Node.js · Express · MongoDB Atlas · JWT · bcrypt · Nodemailer · PDFKit

---

## Project Structure

```
vendorbridge/
│
├── server.js                   # Entry point — boots server, connects DB
├── app.js                      # Express app — middleware, routes, error handling
├── package.json
├── .env.example
├── .gitignore
│
├── config/
│   └── db.js                   # MongoDB Atlas connection
│
├── models/
│   └── User.js                 # ✅ Authentication module
│   (upcoming modules will add:)
│   ├── Vendor.js
│   ├── RFQ.js
│   ├── Quotation.js
│   ├── Approval.js
│   ├── PurchaseOrder.js
│   ├── Invoice.js
│   └── Notification.js
│
├── controllers/
│   └── auth.controller.js      # ✅ register, login, logout, refresh, verify, reset
│   (upcoming:)
│   ├── vendor.controller.js
│   ├── rfq.controller.js
│   ├── quotation.controller.js
│   ├── approval.controller.js
│   ├── purchaseOrder.controller.js
│   ├── invoice.controller.js
│   ├── notification.controller.js
│   └── dashboard.controller.js
│
├── routes/
│   ├── index.js                # ✅ Route aggregator
│   └── auth.routes.js          # ✅ Auth endpoints
│   (upcoming:)
│   ├── vendor.routes.js
│   ├── rfq.routes.js
│   ├── quotation.routes.js
│   ├── approval.routes.js
│   ├── purchaseOrder.routes.js
│   ├── invoice.routes.js
│   ├── notification.routes.js
│   └── dashboard.routes.js
│
├── middleware/
│   ├── auth.middleware.js       # ✅ protect(), authorize(), optionalProtect()
│   ├── validate.middleware.js   # ✅ express-validator chains per route
│   ├── error.middleware.js      # ✅ notFound + global errorHandler
│   └── rateLimiter.middleware.js # ✅ apiLimiter, authLimiter, emailLimiter
│
├── services/
│   └── email.service.js        # ✅ Nodemailer — verify, reset, welcome
│   (upcoming:)
│   ├── pdf.service.js          # PDFKit invoice generation
│   └── notification.service.js
│
└── utils/
    ├── jwt.utils.js            # ✅ Token generation, verification, hashing
    └── response.utils.js       # ✅ sendSuccess(), sendError() helpers
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, JWT secrets, SMTP credentials
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run in production
```bash
npm start
```

---

## Auth API Endpoints

| Method | Endpoint                              | Access    | Description                  |
|--------|---------------------------------------|-----------|------------------------------|
| POST   | `/api/v1/auth/register`               | Public    | Register new user            |
| GET    | `/api/v1/auth/verify-email/:token`    | Public    | Verify email address         |
| POST   | `/api/v1/auth/login`                  | Public    | Login, returns token pair    |
| POST   | `/api/v1/auth/refresh`                | Public    | Refresh access token         |
| POST   | `/api/v1/auth/forgot-password`        | Public    | Send password reset email    |
| POST   | `/api/v1/auth/reset-password/:token`  | Public    | Reset password via token     |
| POST   | `/api/v1/auth/logout`                 | Private   | Logout, invalidates refresh  |
| GET    | `/api/v1/auth/me`                     | Private   | Get current user             |
| PUT    | `/api/v1/auth/change-password`        | Private   | Change password              |
| POST   | `/api/v1/auth/resend-verification`    | Private   | Resend verification email    |
| GET    | `/api/v1/health`                      | Public    | Health check                 |

---

## User Roles

| Role                  | Key Capabilities                                          |
|-----------------------|-----------------------------------------------------------|
| `admin`               | Manage users, vendors, view all analytics                 |
| `procurement_officer` | Create RFQs, compare quotations, generate POs & invoices  |
| `manager`             | Approve/reject procurement requests, monitor workflows    |
| `vendor`              | Submit quotations, track RFQ status, view POs             |

---

## Authentication Flow

```
Client                          Server
  │                               │
  ├── POST /register ────────────>│ Hash password (bcrypt)
  │<── 201 { user } ─────────────┤ Send verification email
  │                               │
  ├── GET /verify-email/:token ──>│ Validate token, mark verified
  │<── 200 ───────────────────────┤
  │                               │
  ├── POST /login ───────────────>│ Compare password
  │<── 200 { accessToken,         │ Return access (15m) + refresh (7d)
  │          refreshToken } ──────┤ Store hashed refresh in DB
  │                               │
  ├── GET /protected ────────────>│ Verify access token (Bearer)
  │   Authorization: Bearer ...   │ Attach req.user
  │<── 200 { data } ──────────────┤
  │                               │
  ├── POST /refresh ─────────────>│ Verify refresh, rotate tokens
  │<── 200 { accessToken,         │
  │          refreshToken } ──────┤
  │                               │
  ├── POST /logout ──────────────>│ Clear DB refresh token + cookie
  │<── 200 ───────────────────────┤
```

---

## Upcoming Modules

To be built in subsequent phases:

- **Module 2** — Vendor Management (CRUD, categories, GST, status tracking)
- **Module 3** — RFQ Management (create, assign vendors, deadlines, attachments)
- **Module 4** — Quotation Submission (vendor pricing, delivery timelines)
- **Module 5** — Quotation Comparison (side-by-side, lowest price highlighting)
- **Module 6** — Approval Workflow (approve/reject, remarks, state transitions)
- **Module 7** — Purchase Orders (auto-generated PO numbers, status tracking)
- **Module 8** — Invoice Generation (PDFKit, tax calculations, download)
- **Module 9** — Email Invoice (Nodemailer, PDF attachment)
- **Module 10** — Notifications (in-app + email alerts)
- **Module 11** — Dashboard Analytics (spending summaries, trends, vendor metrics)
=======
# vendorBridge
>>>>>>> b395d48dd8484ecd95aaad38f3928c51e55e123d
