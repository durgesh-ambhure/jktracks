# React Router Route Table

Maps each page in PAGES.md to a route element, guard, and permission key.
`Public` = no auth. `Auth` = requires valid session. Permission keys follow `module.action`.

| Path | Element | Guard | Permission |
|---|---|---|---|
| /login | LoginPage | Public | - |
| /forgot-password | ForgotPasswordPage | Public | - |
| /reset-password | ResetPasswordPage | Public | - |
| / | → redirect to /dashboard | Auth | - |
| /dashboard | DashboardPage | Auth | dashboard.read |
| /shipments | ShipmentListPage | Auth | shipments.read |
| /shipments/create | ShipmentCreatePage | Auth | shipments.create |
| /shipments/:id | ShipmentDetailPage | Auth | shipments.read |
| /shipments/:id/edit | ShipmentEditPage | Auth | shipments.update |
| /shipments/print | PrintAwbPage | Auth | shipments.read |
| /tracking | TrackingSearchPage | Auth | tracking.read |
| /tracking/:awb | TrackingDetailPage | Auth | tracking.read |
| /shipment-movement | ShipmentMovementPage | Auth | shipments.update |
| /api-request-response | ApiLogPage | Auth | shipments.read |
| /customers | CustomerListPage | Auth | customers.read |
| /customers/create | CustomerCreatePage | Auth | customers.create |
| /customers/:id | CustomerDetailPage | Auth | customers.read |
| /customers/:id/edit | CustomerEditPage | Auth | customers.update |
| /customers/vas | CustomerVasPage | Auth | customers.update |
| /couriers | CourierListPage | Auth | couriers.read |
| /couriers/create | CourierCreatePage | Auth | couriers.create |
| /couriers/:id | CourierDetailPage | Auth | couriers.read |
| /couriers/:id/edit | CourierEditPage | Auth | couriers.update |
| /couriers/accounts | CourierAccountsPage | Auth | couriers.update |
| /couriers/service-configuration | CourierServiceConfigPage | Auth | couriers.update |
| /masters/* (10 pages) | MasterGenericPage (parameterized by master key) | Auth | masters.read/update |
| /invoices | InvoiceListPage | Auth | invoices.read |
| /invoices/create | InvoiceCreatePage | Auth | invoices.create |
| /invoices/:id | InvoiceDetailPage | Auth | invoices.read |
| /invoices/regenerate | InvoiceRegeneratePage | Auth | invoices.update |
| /invoices/print/:id | InvoicePrintPage | Auth | invoices.read |
| /invoices/client-rate-entry | ClientRateEntryPage | Auth | invoices.update |
| /invoices/client-tax-rate | ClientTaxRatePage | Auth | invoices.update |
| /invoices/vendor-rate-entry | VendorRateEntryPage | Auth | invoices.update |
| /invoices/vendor-fuel-surcharge | VendorFuelSurchargePage | Auth | invoices.update |
| /invoices/rate-enquiry | VendorRateEnquiryPage | Auth | invoices.read |
| /invoices/client-rate-enquiry | ClientRateEnquiryPage | Auth | invoices.read |
| /invoices/irn | GenerateIrnPage | Auth | invoices.update |
| /invoices/irn/report | IrnReportPage | Auth | invoices.read |
| /invoices/topay | TopayInvoicePage | Auth | invoices.create |
| /invoices/cargo-tax | CargoTaxInvoicePage | Auth | invoices.create |
| /invoices/billing-report | BillingReportPage | Auth | invoices.read |
| /payments | PaymentListPage | Auth | payments.read |
| /payments/record | PaymentRecordPage | Auth | payments.create |
| /payments/history | PaymentHistoryPage | Auth | payments.read |
| /reports/sales | SalesReportPage | Auth | reports.read |
| /reports/vendor-contribution | VendorContributionPage | Auth | reports.read |
| /reports/trend | TrendReportPage | Auth | reports.read |
| /reports/user-logs | UserLogsPage | Auth | reports.read |
| /reports/client-outstanding | ClientOutstandingPage | Auth | reports.read |
| /import/* (9 pages) | ImportGenericPage (parameterized) | Auth | import.create |
| /kyc | KycPage | Auth | kyc.read |
| /accounting/entry | AccountEntryPage | Auth | accounting.update |
| /accounting/journal | JournalEntryPage | Auth | accounting.update |
| /accounting/receipt | ReceiptEntryPage | Auth | accounting.update |
| /accounting/ledger | LedgerViewPage | Auth | accounting.read |
| /accounting/client-outstanding | AccountingOutstandingPage | Auth | accounting.read |
| /users | UserListPage | Auth | users.read |
| /users/create | UserCreatePage | Auth | users.create |
| /users/:id | UserDetailPage | Auth | users.read |
| /users/:id/edit | UserEditPage | Auth | users.update |
| /user-groups | UserGroupPage | Auth | users.update |
| /group-rights | GroupRightsPage | Auth | users.update |
| /user-rights | UserRightsPage | Auth | users.update |
| /change-password | ChangePasswordPage | Auth | - |
| /settings/profile | UserProfilePage | Auth | - |
| /settings/table-page-size | GridPageSizePage | Auth | settings.update |
| /settings/mail-sms-format | MailSmsFormatPage | Auth | settings.update |
