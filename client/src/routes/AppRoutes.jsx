import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardPage from '../pages/dashboard/DashboardPage';

import ShipmentListPage from '../pages/shipments/ShipmentListPage';
import ShipmentCreatePage from '../pages/shipments/ShipmentCreatePage';
import ShipmentDetailPage from '../pages/shipments/ShipmentDetailPage';
import ShipmentEditPage from '../pages/shipments/ShipmentEditPage';
import PrintAwbPage from '../pages/shipments/PrintAwbPage';

import TrackingSearchPage from '../pages/tracking/TrackingSearchPage';
import TrackingDetailPage from '../pages/tracking/TrackingDetailPage';
import ShipmentMovementPage from '../pages/tracking/ShipmentMovementPage';
import ApiLogPage from '../pages/tracking/ApiLogPage';

import CustomerListPage from '../pages/customers/CustomerListPage';
import CustomerCreatePage from '../pages/customers/CustomerCreatePage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';
import CustomerEditPage from '../pages/customers/CustomerEditPage';
import CustomerVasPage from '../pages/customers/CustomerVasPage';

import CourierListPage from '../pages/couriers/CourierListPage';
import CourierCreatePage from '../pages/couriers/CourierCreatePage';
import CourierDetailPage from '../pages/couriers/CourierDetailPage';
import CourierEditPage from '../pages/couriers/CourierEditPage';
import CourierAccountsPage from '../pages/couriers/CourierAccountsPage';
import CourierServiceConfigPage from '../pages/couriers/CourierServiceConfigPage';

import MasterGenericPage from '../pages/masters/MasterGenericPage';

import InvoiceListPage from '../pages/invoices/InvoiceListPage';
import InvoiceCreatePage from '../pages/invoices/InvoiceCreatePage';
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage';
import InvoiceRegeneratePage from '../pages/invoices/InvoiceRegeneratePage';
import InvoicePrintPage from '../pages/invoices/InvoicePrintPage';
import ClientRateEntryPage from '../pages/invoices/ClientRateEntryPage';
import ClientTaxRatePage from '../pages/invoices/ClientTaxRatePage';
import VendorRateEntryPage from '../pages/invoices/VendorRateEntryPage';
import VendorFuelSurchargePage from '../pages/invoices/VendorFuelSurchargePage';
import VendorRateEnquiryPage from '../pages/invoices/VendorRateEnquiryPage';
import ClientRateEnquiryPage from '../pages/invoices/ClientRateEnquiryPage';
import GenerateIrnPage from '../pages/invoices/GenerateIrnPage';
import IrnReportPage from '../pages/invoices/IrnReportPage';
import TopayInvoicePage from '../pages/invoices/TopayInvoicePage';
import CargoTaxInvoicePage from '../pages/invoices/CargoTaxInvoicePage';
import BillingReportPage from '../pages/invoices/BillingReportPage';

import PaymentListPage from '../pages/payments/PaymentListPage';
import PaymentRecordPage from '../pages/payments/PaymentRecordPage';
import PaymentHistoryPage from '../pages/payments/PaymentHistoryPage';

import SalesReportPage from '../pages/reports/SalesReportPage';
import VendorContributionPage from '../pages/reports/VendorContributionPage';
import TrendReportPage from '../pages/reports/TrendReportPage';
import UserLogsPage from '../pages/reports/UserLogsPage';
import ClientOutstandingPage from '../pages/reports/ClientOutstandingPage';

import ImportGenericPage from '../pages/import/ImportGenericPage';

import KycPage from '../pages/kyc/KycPage';

import AccountEntryPage from '../pages/accounting/AccountEntryPage';
import JournalEntryPage from '../pages/accounting/JournalEntryPage';
import ReceiptEntryPage from '../pages/accounting/ReceiptEntryPage';
import LedgerViewPage from '../pages/accounting/LedgerViewPage';
import AccountingOutstandingPage from '../pages/accounting/AccountingOutstandingPage';

import UserListPage from '../pages/users/UserListPage';
import UserCreatePage from '../pages/users/UserCreatePage';
import UserDetailPage from '../pages/users/UserDetailPage';
import UserEditPage from '../pages/users/UserEditPage';
import UserGroupPage from '../pages/users/UserGroupPage';
import GroupRightsPage from '../pages/users/GroupRightsPage';
import UserRightsPage from '../pages/users/UserRightsPage';
import ChangePasswordPage from '../pages/users/ChangePasswordPage';

import UserProfilePage from '../pages/settings/UserProfilePage';
import GridPageSizePage from '../pages/settings/GridPageSizePage';
import MailSmsFormatPage from '../pages/settings/MailSmsFormatPage';

import NotAuthorizedPage from '../pages/common/NotAuthorizedPage';

import { MASTER_DEFINITIONS, IMPORT_DEFINITIONS } from '../utils/constants';

function Protected({ permission, children }) {
  return (
    <ProtectedRoute permission={permission}>
      {children}
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Protected permission="dashboard.read"><DashboardPage /></Protected>} />

        {/* Shipments */}
        <Route path="/shipments" element={<Protected permission="shipments.read"><ShipmentListPage /></Protected>} />
        <Route path="/shipments/create" element={<Protected permission="shipments.create"><ShipmentCreatePage /></Protected>} />
        <Route path="/shipments/print" element={<Protected permission="shipments.read"><PrintAwbPage /></Protected>} />
        <Route path="/shipments/:id/edit" element={<Protected permission="shipments.update"><ShipmentEditPage /></Protected>} />
        <Route path="/shipments/:id" element={<Protected permission="shipments.read"><ShipmentDetailPage /></Protected>} />

        {/* Tracking */}
        <Route path="/tracking" element={<Protected permission="tracking.read"><TrackingSearchPage /></Protected>} />
        <Route path="/tracking/:awb" element={<Protected permission="tracking.read"><TrackingDetailPage /></Protected>} />
        <Route path="/shipment-movement" element={<Protected permission="shipments.update"><ShipmentMovementPage /></Protected>} />
        <Route path="/api-request-response" element={<Protected permission="shipments.read"><ApiLogPage /></Protected>} />

        {/* Customers */}
        <Route path="/customers" element={<Protected permission="customers.read"><CustomerListPage /></Protected>} />
        <Route path="/customers/create" element={<Protected permission="customers.create"><CustomerCreatePage /></Protected>} />
        <Route path="/customers/vas" element={<Protected permission="customers.update"><CustomerVasPage /></Protected>} />
        <Route path="/customers/:id/edit" element={<Protected permission="customers.update"><CustomerEditPage /></Protected>} />
        <Route path="/customers/:id" element={<Protected permission="customers.read"><CustomerDetailPage /></Protected>} />

        {/* Couriers */}
        <Route path="/couriers" element={<Protected permission="couriers.read"><CourierListPage /></Protected>} />
        <Route path="/couriers/create" element={<Protected permission="couriers.create"><CourierCreatePage /></Protected>} />
        <Route path="/couriers/accounts" element={<Protected permission="couriers.update"><CourierAccountsPage /></Protected>} />
        <Route path="/couriers/service-configuration" element={<Protected permission="couriers.update"><CourierServiceConfigPage /></Protected>} />
        <Route path="/couriers/:id/edit" element={<Protected permission="couriers.update"><CourierEditPage /></Protected>} />
        <Route path="/couriers/:id" element={<Protected permission="couriers.read"><CourierDetailPage /></Protected>} />

        {/* Masters — one generic page mounted per key */}
        {MASTER_DEFINITIONS.map((m) => (
          <Route
            key={m.key}
            path={`/masters/${m.key}`}
            element={
              <Protected permission="masters.read">
                <MasterGenericPage masterKey={m.key} title={m.title} fields={m.fields} />
              </Protected>
            }
          />
        ))}

        {/* Invoices */}
        <Route path="/invoices" element={<Protected permission="invoices.read"><InvoiceListPage /></Protected>} />
        <Route path="/invoices/create" element={<Protected permission="invoices.create"><InvoiceCreatePage /></Protected>} />
        <Route path="/invoices/regenerate" element={<Protected permission="invoices.update"><InvoiceRegeneratePage /></Protected>} />
        <Route path="/invoices/print/:id" element={<Protected permission="invoices.read"><InvoicePrintPage /></Protected>} />
        <Route path="/invoices/client-rate-entry" element={<Protected permission="invoices.update"><ClientRateEntryPage /></Protected>} />
        <Route path="/invoices/client-tax-rate" element={<Protected permission="invoices.update"><ClientTaxRatePage /></Protected>} />
        <Route path="/invoices/vendor-rate-entry" element={<Protected permission="invoices.update"><VendorRateEntryPage /></Protected>} />
        <Route path="/invoices/vendor-fuel-surcharge" element={<Protected permission="invoices.update"><VendorFuelSurchargePage /></Protected>} />
        <Route path="/invoices/rate-enquiry" element={<Protected permission="invoices.read"><VendorRateEnquiryPage /></Protected>} />
        <Route path="/invoices/client-rate-enquiry" element={<Protected permission="invoices.read"><ClientRateEnquiryPage /></Protected>} />
        <Route path="/invoices/irn/report" element={<Protected permission="invoices.read"><IrnReportPage /></Protected>} />
        <Route path="/invoices/irn" element={<Protected permission="invoices.update"><GenerateIrnPage /></Protected>} />
        <Route path="/invoices/topay" element={<Protected permission="invoices.create"><TopayInvoicePage /></Protected>} />
        <Route path="/invoices/cargo-tax" element={<Protected permission="invoices.create"><CargoTaxInvoicePage /></Protected>} />
        <Route path="/invoices/billing-report" element={<Protected permission="invoices.read"><BillingReportPage /></Protected>} />
        <Route path="/invoices/:id" element={<Protected permission="invoices.read"><InvoiceDetailPage /></Protected>} />

        {/* Payments */}
        <Route path="/payments" element={<Protected permission="payments.read"><PaymentListPage /></Protected>} />
        <Route path="/payments/record" element={<Protected permission="payments.create"><PaymentRecordPage /></Protected>} />
        <Route path="/payments/history" element={<Protected permission="payments.read"><PaymentHistoryPage /></Protected>} />

        {/* Reports */}
        <Route path="/reports/sales" element={<Protected permission="reports.read"><SalesReportPage /></Protected>} />
        <Route path="/reports/vendor-contribution" element={<Protected permission="reports.read"><VendorContributionPage /></Protected>} />
        <Route path="/reports/trend" element={<Protected permission="reports.read"><TrendReportPage /></Protected>} />
        <Route path="/reports/user-logs" element={<Protected permission="reports.read"><UserLogsPage /></Protected>} />
        <Route path="/reports/client-outstanding" element={<Protected permission="reports.read"><ClientOutstandingPage /></Protected>} />

        {/* Excel Import — one generic page mounted per key */}
        {IMPORT_DEFINITIONS.map((imp) => (
          <Route
            key={imp.key}
            path={`/import/${imp.key}`}
            element={
              <Protected permission="import.create">
                <ImportGenericPage importKey={imp.key} title={imp.title} />
              </Protected>
            }
          />
        ))}

        {/* KYC */}
        <Route path="/kyc" element={<Protected permission="kyc.read"><KycPage /></Protected>} />

        {/* Accounting */}
        <Route path="/accounting/entry" element={<Protected permission="accounting.update"><AccountEntryPage /></Protected>} />
        <Route path="/accounting/journal" element={<Protected permission="accounting.update"><JournalEntryPage /></Protected>} />
        <Route path="/accounting/receipt" element={<Protected permission="accounting.update"><ReceiptEntryPage /></Protected>} />
        <Route path="/accounting/ledger" element={<Protected permission="accounting.read"><LedgerViewPage /></Protected>} />
        <Route path="/accounting/client-outstanding" element={<Protected permission="accounting.read"><AccountingOutstandingPage /></Protected>} />

        {/* Users & Permissions */}
        <Route path="/users" element={<Protected permission="users.read"><UserListPage /></Protected>} />
        <Route path="/users/create" element={<Protected permission="users.create"><UserCreatePage /></Protected>} />
        <Route path="/users/:id/edit" element={<Protected permission="users.update"><UserEditPage /></Protected>} />
        <Route path="/users/:id" element={<Protected permission="users.read"><UserDetailPage /></Protected>} />
        <Route path="/user-groups" element={<Protected permission="users.update"><UserGroupPage /></Protected>} />
        <Route path="/group-rights" element={<Protected permission="users.update"><GroupRightsPage /></Protected>} />
        <Route path="/user-rights" element={<Protected permission="users.update"><UserRightsPage /></Protected>} />
        <Route path="/change-password" element={<Protected><ChangePasswordPage /></Protected>} />

        {/* Settings */}
        <Route path="/settings/profile" element={<Protected><UserProfilePage /></Protected>} />
        <Route path="/settings/table-page-size" element={<Protected permission="settings.update"><GridPageSizePage /></Protected>} />
        <Route path="/settings/mail-sms-format" element={<Protected permission="settings.update"><MailSmsFormatPage /></Protected>} />

        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
