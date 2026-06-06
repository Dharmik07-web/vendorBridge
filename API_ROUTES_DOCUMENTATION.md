# VendorBridge API Routes - Complete Documentation

**Base URL:** `http://localhost:5000/api/v1`

> Generated: June 6, 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Vendors](#vendors)
3. [RFQs](#rfqs)
4. [Quotations](#quotations)
5. [Approvals](#approvals)
6. [Purchase Orders](#purchase-orders)
7. [Invoices](#invoices)
8. [Notifications](#notifications)
9. [Dashboard](#dashboard)

---

## Authentication

**Endpoint:** `/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login with credentials |
| GET | `/me` | Private | Get current user profile |
| PUT | `/profile` | Private | Update user profile |
| PUT | `/change-password` | Private | Change password |
| GET | `/users` | Admin | Get all users |
| PUT | `/users/:id/toggle` | Admin | Toggle user status |

---

## Vendors

**Endpoint:** `/vendors`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all vendors (with search, filter, pagination) |
| POST | `/` | Admin, PO* | Create new vendor |
| GET | `/:id` | Private | Get single vendor |
| PUT | `/:id` | Admin, PO | Update vendor |
| DELETE | `/:id` | Admin | Delete vendor |
| PATCH | `/:id/status` | Admin | Update vendor status (approve/reject/suspend) |
| GET | `/categories` | Private | Get vendor categories |

*PO = Procurement Officer

---

## RFQs

**Endpoint:** `/rfqs`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all RFQs (with filtering, pagination) |
| POST | `/` | Admin, PO | Create new RFQ |
| GET | `/:id` | Private | Get single RFQ with vendor details |
| PUT | `/:id` | Admin, PO | Update RFQ |
| PATCH | `/:id/publish` | Admin, PO | Publish RFQ to vendors |
| PATCH | `/:id/close` | Admin, PO | Close RFQ (stop submissions) |
| PATCH | `/:id/cancel` | Admin | Cancel RFQ |
| POST | `/:id/vendors` | Admin, PO | Assign vendors to RFQ |

---

## Quotations

**Endpoint:** `/quotations`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all quotations (with filtering) |
| POST | `/` | Vendor | Submit quotation for RFQ |
| GET | `/:id` | Private | Get single quotation |
| GET | `/compare/:rfqId` | Admin, PO, Manager | Compare quotations for RFQ (side-by-side) |
| PUT | `/:id` | Admin, PO | Review quotation (accept/reject) |
| DELETE | `/:id` | Vendor | Withdraw quotation |

---

## Approvals

**Endpoint:** `/approvals`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Admin, Manager | Get all approvals (pending, completed) |
| POST | `/` | Admin, PO | Initiate approval workflow |
| GET | `/:id` | Admin, Manager | Get single approval |
| PUT | `/:id` | Admin, Manager | Process approval (approve/reject) |
| DELETE | `/:id` | Admin | Cancel approval workflow |

---

## Purchase Orders

**Endpoint:** `/purchase-orders`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all purchase orders |
| POST | `/` | Admin, PO | Generate PO from approved quotation |
| GET | `/:id` | Private | Get single PO |
| PATCH | `/:id/status` | Admin, PO | Update PO status |

---

## Invoices

**Endpoint:** `/invoices`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all invoices |
| POST | `/` | Admin, PO | Generate invoice from PO |
| GET | `/:id` | Private | Get single invoice |
| GET | `/:id/download` | Private | Download invoice as PDF |
| POST | `/:id/send-email` | Admin, PO | Send invoice via email |
| PATCH | `/:id/payment-status` | Admin | Update invoice payment status |

---

## Notifications

**Endpoint:** `/notifications`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get all notifications for user |
| PATCH | `/:id/read` | Private | Mark single notification as read |
| PATCH | `/mark-all-read` | Private | Mark all notifications as read |
| DELETE | `/:id` | Private | Delete single notification |
| DELETE | `/clear-read` | Private | Delete all read notifications |

---

## Dashboard

**Endpoint:** `/dashboard`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/summary` | Admin, Manager, PO | Get dashboard summary (pending approvals, active RFQs, stats) |
| GET | `/analytics` | Admin, Manager, PO | Get detailed analytics (spending trends, vendor performance) |
| GET | `/activity-logs` | Admin | Get activity logs (audit trail) |

---

## Health Check

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/health` | Public | API health check |

---

## User Roles Reference

| Role | Permissions |
|------|------------|
| `admin` | Full access to all modules, user/vendor management |
| `procurement_officer` | Create/manage RFQs, quotations, POs, invoices |
| `manager` | Approve/reject quotations, monitor workflows |
| `vendor` | Submit quotations, view RFQs, track POs |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {}
}
```

---

## Authentication

All private endpoints require:
```
Authorization: Bearer <access_token>
```

Tokens are obtained from `/auth/login` endpoint.

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: Rate limited separately
- Email endpoints: Limited to prevent spam

---

## File Upload

Multipart endpoints support file uploads via `multer`:
- Max file size: 5MB
- Allowed types: PDF, Excel, Images (as per controller validation)

---

## Pagination

For endpoints that support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (field name)
- `order` (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Testing

**Health Check:**
```bash
curl -X GET http://localhost:5000/api/v1/health
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "procurement_officer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

**All routes are now fully functional and accessible!** ✅
