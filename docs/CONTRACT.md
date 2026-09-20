# Frontend/Backend Contract (v1)

This is the single source of truth shared by the `server/` build and the `client/` build.
Both must conform to this file exactly (field names, casing, response envelope) so they
integrate without a coordination pass. If either side needs to deviate, update this file
in the same change.

## Build priority (this pass)

**Tier 1 — full CRUD + validation + real persistence (build first, must be complete):**
Auth, Users, Roles/Permissions, Dashboard, Customers, Couriers (Vendors), Shipments,
Shipment Movement / Tracking, Reports (sales + booking summary using real Shipment data).

**Tier 2 — skeleton (route + Mongoose model + list/detail UI shell + one working create form,
no deep business logic yet; mark clearly in UI with a "Coming soon" section for anything not
wired up):** Masters (zones, charge types, countries/states/cities, pincodes, ODA mapping,
tracking-event mapping, reasons, HSN), Invoices, Payments, Excel Import, KYC, Accounting,
Settings pages.

Do not skip Tier 2 routes — they must exist and render without crashing (empty state is fine),
per prompt rule §33 ("preserve page name, create route, create UI skeleton, document what
remains").

## Response envelope (server always returns this shape)

```json
// success
{ "success": true, "message": "string", "data": {} }

// list (paginated)
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }

// error
{ "success": false, "message": "string", "errors": [ { "field": "string", "message": "string" } ] }
```

HTTP status: 200/201 success, 400 validation, 401 unauthenticated, 403 unauthorized,
404 not found, 409 conflict (duplicate), 500 server error.

## Auth

- JWT access token (15m) returned in response body; refresh token (7d) set as HTTP-only cookie.
- `Authorization: Bearer <token>` header on all protected requests.
- Login identifies a user by `userCode` + `password` (mirrors reference "Account No / User
  Code / Password"); we simplify to `email` + `password` for the independent rebuild but keep
  a `userCode` field for display, matching the reference UI convention (e.g. `3490`).

```
POST /api/v1/auth/login          { email, password } -> { user, accessToken }
POST /api/v1/auth/logout         {} -> {}
POST /api/v1/auth/refresh        (cookie) -> { accessToken }
GET  /api/v1/auth/me             -> { user }
POST /api/v1/auth/forgot-password { email } -> {}
POST /api/v1/auth/reset-password  { token, newPassword } -> {}
POST /api/v1/auth/change-password { currentPassword, newPassword } -> {}
```

`user` object shape (also what `GET /auth/me` returns):
```json
{
  "id": "...", "userCode": "3490", "name": "Krunal Nathvani", "email": "...",
  "role": "ADMIN", "permissions": ["shipments.read", "shipments.create", "..."],
  "companyCode": "CM2813"
}
```

## Roles (seeded, fixed set for this pass)

`SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER` — permission strings are `module.action` where
module ∈ {dashboard, shipments, tracking, customers, couriers, masters, invoices, payments,
reports, import, kyc, accounting, users, settings} and action ∈ {read, create, update, delete}.
SUPER_ADMIN has all permissions implicitly (backend short-circuits the check).

## Mongoose models (Tier 1)

### User
`userCode(string,unique), name, email(unique), passwordHash, role(ref Role|enum string),
companyCode, isActive(bool), lastLoginAt, createdAt, updatedAt`

### Role
`name(unique, one of the 5 above), permissions:[string]`

### Client (Customer)
`clientCode(unique), name, contactPerson, email, phone, address1, address2, city, state,
country, pincode, gstin, pan, creditLimit(number), status(ACTIVE|INACTIVE), createdAt`

### Vendor (Courier)
`vendorCode(unique), name, apiUrl, apiKey(select:false — never returned to client), status,
serviceTypes:[{ name, code }], trackingEnabled(bool), createdAt`

### Shipment
```
awbNo(unique, indexed), refNo, bookingDate, clientId(ref Client), businessType(B2B|B2C|C2C),
consignor: { name, contactPerson, address1, address2, address3, pincode, country, state, city,
             phone, phone2, email, pan, gstin, iec, aadhaarNo, bankADCode, bankAC, bankIFSC },
consignee: { name, contactPerson, address1, address2, address3, pincode, country, state, city,
             phone, phone2, email, pan, gstin, iec, aadhaarNo, iossNo, iossAmount },
packetType(DOX|SPX), paymentType(CASH|COD|CREDIT|WALLET), amount, currency, invoiceNo,
packetDescription, invoiceDescription,
weightDetails: { pieces, actualWeight, vendorWeight, weightUnit(KGS|LBS), totalValue,
                 valueCurrency, divisor, isVolumetric, boxes:[{ length,width,height,pcs,
                 actualWeight,volumetricWeight }] },
forwarding: { vendorId(ref Vendor), serviceType, packaging, forwardingNo1, forwardingNo2,
              vendorAccountNo, dutiesAccountNo, billDutiesTo(SENDER|RECIPIENT),
              billShipmentTo(SENDER|RECIPIENT), pickupPoint, incoterms(DDP|DDU),
              shipmentPurpose },
clientCharges: { freight, otherCharges, fuel, gst, total },
vendorCharges: { freight, otherCharges, fuel, gst, total },
status(BOOKED|PICKED UP|INTRANSIT|ARRIVED|PACKET AT HUB|HANDOVER TO CARRIER|OUT FOR DELIVERY|
       DELIVERED|UN-DELIVERED|RTO|HOLD AT CUSTOM|CANCELLED),
isCancelled(bool), cancellationReason, operationRemarks, accountingRemarks,
createdBy(ref User), createdAt, updatedAt
```

### ShipmentEvent (movement/timeline — powers Tracking)
`shipmentId(ref Shipment, indexed), awbNo(indexed), date, time, status, reasonCode,
location, statusDetails, createdBy(ref User), createdAt`

### AuditLog
`userId, action(INSERT|UPDATE|DELETE|LOGIN|LOGOUT|CANCEL|EMAIL|COPY|OPEN), entity, entityId,
formName, actionDescription, refNo, previousValue, newValue, ip, userAgent, createdAt`

## API endpoints (Tier 1)

```
GET    /api/v1/dashboard/summary        -> { totalShipments, delivered, pending, rto,
                                              revenue, outstanding, codAmount,
                                              recentShipments:[...], statusBreakdown:[...],
                                              revenueTrend:[...] }

GET    /api/v1/customers?search=&status=&page=&limit=
POST   /api/v1/customers
GET    /api/v1/customers/:id
PATCH  /api/v1/customers/:id
DELETE /api/v1/customers/:id

GET    /api/v1/couriers?search=&page=&limit=
POST   /api/v1/couriers
GET    /api/v1/couriers/:id
PATCH  /api/v1/couriers/:id
DELETE /api/v1/couriers/:id

GET    /api/v1/shipments?search=&status=&clientId=&fromDate=&toDate=&paymentType=&page=&limit=
POST   /api/v1/shipments
GET    /api/v1/shipments/:id
PATCH  /api/v1/shipments/:id
DELETE /api/v1/shipments/:id
POST   /api/v1/shipments/:id/cancel      { reason }
GET    /api/v1/shipments/export          (CSV, same filters as list)

GET    /api/v1/tracking/:awb             -> shipment + events[] (public-in-app lookup)
POST   /api/v1/shipments/:id/events      { date, time, status, reasonCode, location, statusDetails }
GET    /api/v1/shipments/:id/events

GET    /api/v1/reports/sales?fromDate=&toDate=&groupBy=&clientId=
GET    /api/v1/reports/booking-summary

GET    /api/v1/users?search=&page=&limit=
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/roles
```

Tier 2 routes exist under `/api/v1/masters/:key`, `/api/v1/invoices`, `/api/v1/payments`,
`/api/v1/imports/:key`, `/api/v1/kyc`, `/api/v1/accounting/*`, `/api/v1/settings/*` — generic
CRUD (list/create/get/update/delete) against a loosely-typed Mongoose model per key, sufficient
to back the Tier 2 skeleton UI. Full field-level validation for these is a documented TODO.

## Sidebar navigation config (frontend, single source for the Sidebar component)

Frontend must render the sidebar from `client/src/routes/navigation.ts` (or .js), an array of
`{ title, icon, path?, children?: [...], permission? }`, matching the hierarchy in PAGES.md
exactly (same section order, same labels) so it visually matches the discovered IA. Do not
hardcode `<nav>` markup per page.

## Non-negotiables

- Never send `apiKey`/secrets to the client (Mongoose `select: false` + explicit `.select()`
  exclusion).
- All list endpoints paginate server-side; no "fetch all and filter in React".
- Passwords hashed with bcrypt (cost 10+), never logged.
- Every Tier 1 mutation writes an AuditLog entry.
