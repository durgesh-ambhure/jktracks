# Application Pages

Derived from the reference courier-management admin panel (sidebar + 5 captured pages + login screen).
This is the authoritative page/route inventory for the independent rebuild. Do not add pages beyond
this list without updating this file first.

## Authentication
```
/login
/forgot-password
/reset-password
```

## Dashboard
```
/dashboard
```

## Shipments (reference: International Booking, Booking Report, Print AWB Document)
```
/shipments
/shipments/create
/shipments/:id
/shipments/:id/edit
/shipments/print                 (Print AWB Document)
```

## Tracking (reference: AWB Query, Shipment Movement, Get API Request Response)
```
/tracking
/tracking/:awb
/shipment-movement                (status/movement update form)
/api-request-response             (API request/response log viewer)
```

## Customers (reference: Client Master, Client VAS Detail)
```
/customers
/customers/create
/customers/:id
/customers/:id/edit
/customers/vas                    (Client VAS Detail)
```

## Couriers / Vendors (reference: Vendor Master, Vendor Account Detail, Vendor Accounts Master)
```
/couriers
/couriers/create
/couriers/:id
/couriers/:id/edit
/couriers/accounts                (Vendor Account Detail + Vendor Accounts Master)
/couriers/service-configuration   (Vendor Service Configuration, under Settings in reference)
```

## Masters (reference: Master menu)
```
/masters/zones
/masters/charge-types
/masters/fuel-charges             (Client Fuel Charge Master)
/masters/countries
/masters/states
/masters/cities
/masters/pincodes
/masters/oda-pincode-mapping
/masters/tracking-event-mapping
/masters/reasons                  (Reason Master)
/masters/hsn
```

## Invoices (reference: Invoice menu)
```
/invoices
/invoices/create                  (Generate Client Bill)
/invoices/:id
/invoices/regenerate              (Re-Generate Client Bill)
/invoices/print/:id
/invoices/client-rate-entry
/invoices/client-tax-rate
/invoices/vendor-rate-entry
/invoices/vendor-fuel-surcharge
/invoices/rate-enquiry            (Vendor Rate Enquiry)
/invoices/client-rate-enquiry
/invoices/irn
/invoices/irn/report
/invoices/topay                   (Generate Cash/ToPay Invoice)
/invoices/cargo-tax               (Generate Cargo Tax Invoice)
/invoices/billing-report
```

## Payments
```
/payments
/payments/record
/payments/history                 (Payment History, under Settings in reference)
```

## Reports (reference: Report + Admin Report menus)
```
/reports
/reports/sales
/reports/vendor-contribution
/reports/trend
/reports/user-logs
/reports/client-outstanding
```

## Excel Import (reference: Excel Import menu)
```
/import/client-rate
/import/client-rate-vendor-wise
/import/vendor-rate
/import/vendor-rate-fedex-dhl
/import/zone
/import/vendor-pincode
/import/bulk-shipment-movement
/import/oda-pincode-mapping
/import/covid-charge
```

## KYC
```
/kyc
```

## Accounting
```
/accounting/entry                 (Account Entry)
/accounting/journal               (Journal Entry)
/accounting/receipt               (Receipt Entry)
/accounting/ledger                (Ledger View)
/accounting/client-outstanding
```

## Users & Permissions (reference: User & Permission menu)
```
/users
/users/create
/users/:id
/users/:id/edit
/user-groups                      (User Group)
/group-rights                     (Group Rights — menu access per group)
/user-rights                      (User Rights — menu access per user)
/change-password
```

## Settings
```
/settings/profile                 (Your Profile)
/settings/table-page-size         (Grid Page Size)
/settings/mail-sms-format
```
Note: this deployment is a single dedicated client's internal shipment-documentation tool
(not a multi-tenant/reseller SaaS instance), so Company Profile, Company Ledger and Your Plan
— all of which existed in the reference product to manage a franchise/reseller's own business
details and its billing relationship with the SaaS provider — do not apply and were removed.

## Status legend used across docs
- **Full**: implemented with real CRUD + validation + backend persistence.
- **Skeleton**: route + UI shell + backend model exist, business logic is a documented TODO
  (per prompt §33, applies mainly to pages with no reference markup: HSN, Zone, PinCode masters,
  IRN/e-invoice, DHL OTP integration, freight rate engine internals).
