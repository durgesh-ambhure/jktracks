import api, { unwrap } from './api';

const reportService = {
  sales: (params) => unwrap(api.get('/reports/sales', { params })),
  bookingSummary: (params) => unwrap(api.get('/reports/booking-summary', { params })),
  // Not yet in CONTRACT.md as dedicated endpoints — call generic /reports/<key> and let the
  // page handle a 404/501 gracefully with ErrorState + retry until the backend adds them.
  vendorContribution: (params) => unwrap(api.get('/reports/vendor-contribution', { params })),
  trend: (params) => unwrap(api.get('/reports/trend', { params })),
  userLogs: (params) => unwrap(api.get('/reports/user-logs', { params })),
  clientOutstanding: (params) => unwrap(api.get('/reports/client-outstanding', { params })),
};

export default reportService;
