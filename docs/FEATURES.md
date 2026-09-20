# Feature Inventory (by module)

Extracted from reference page markup. See PAGES.md for routes and CONTRACT.md for data models/API.

## Shipments
- Create shipment (International Booking): consignor/consignee full address+tax-ID capture,
  packet type (DOX/SPX), payment type (CASH/COD/CREDIT/WALLET), multi-box weight grid with
  actual/volumetric/charged weight, divisor-based volumetric calc, currency selection,
  forwarding/vendor selection, incoterms, CSB export-compliance fields, document upload,
  auto-computed client & vendor charge breakdown (Freight/Other/Fuel/GST/Total).
- List/search shipments (Booking Report): 20+ filter fields, export, bulk label print, bulk
  status update, per-shipment cancellation with reason.
- Print documents: AWB label (2 formats), forwarder label, invoice, box-wise invoice/label.
- Shipment movement: append timeline event (status, reason code conditional on status,
  location, free-text details, date/time).

## Tracking
- Public-style AWB/Ref/Forwarding-No lookup returning packet details, KYC docs, remarks,
  full tracking history timeline, POD image gallery, charge/weight breakdown popups.
- Add remarks with file attachment against an AWB.
- API request/response audit log per AWB (for courier API integrations).

## Customers (Client Master)
- Standard client CRUD: code, name, contact, GSTIN/PAN, address, credit terms.
- Client VAS (value-added-service) detail assignment.
- Client fuel-charge and tax-rate master (percentage-based surcharge config per client).

## Couriers (Vendor Master)
- Vendor CRUD + per-vendor account numbers + per-vendor service types + API credentials
  (stored server-side only, never sent to frontend) + fuel surcharge configuration.

## Masters
- Zone, Charge Type, Country/State/City, PinCode, ODA-PinCode mapping, Tracking-Event mapping
  (maps courier-specific status strings to internal statuses), Reason codes (large lookup used
  in Shipment Movement), HSN codes.

## Invoicing
- Client rate card entry (rate per zone/weight-break).
- Vendor rate card entry + vendor fuel surcharge.
- Rate enquiry (lookup rate by route/weight without booking).
- Generate / re-generate client bill from a date-range of shipments; print bill.
- IRN (GST e-invoice) generation + report (external gov't API — stubbed).
- Cash/ToPay invoice generation, Cargo high-value tax invoice generation.
- Billing report (search/filter generated invoices).

## Payments & Accounting
- Payment recording against invoices, payment history.
- Account/Journal/Receipt entry, ledger view, client outstanding report.

## Reports
- Sales Report: grouping + FY/Quarter/Month/Daily rollups, profit/expense/sales totals.
- Vendor Contribution, Trend Report (last N months up/down trend by client), User Logs
  (audit trail), Client Outstanding.

## Import (Excel)
- Bulk import: client rates, vendor rates (incl. Fedex/DHL specific layout), zones,
  vendor pincodes, shipment movement (bulk status updates), COVID surcharge, ODA mapping.
  All implemented as: upload -> server-side parse & validate -> preview errors -> commit.

## KYC
- KYC document capture/verification status per shipment/customer.

## Users & Permissions
- User CRUD, User Groups, Group menu-rights matrix, per-user menu-rights override,
  change/reset password. Backend enforces permission checks; frontend hides unauthorized
  nav items using the same permission set.

## Settings
- Company profile, company ledger, plan/subscription info (read-only demo), payment history,
  user profile, grid page-size preference, mail/SMS template format editor.

## Cross-cutting (all list pages)
- Server-side search, filter, sort, pagination; CSV/Excel export; consistent DataTable UI.
