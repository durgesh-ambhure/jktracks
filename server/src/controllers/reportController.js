const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const reportService = require('../services/reportService');

const salesReport = asyncHandler(async (req, res) => {
  const { fromDate, toDate, groupBy, clientId } = req.query;
  const report = await reportService.getSalesReport({ fromDate, toDate, groupBy, clientId });
  sendSuccess(res, { data: report });
});

const bookingSummary = asyncHandler(async (req, res) => {
  const summary = await reportService.getBookingSummary();
  sendSuccess(res, { data: summary });
});

const vendorContribution = asyncHandler(async (req, res) => {
  const { fromDate, toDate, vendorId, clientId } = req.query;
  const report = await reportService.getVendorContribution({ fromDate, toDate, vendorId, clientId });
  sendSuccess(res, { data: report });
});

const trendReport = asyncHandler(async (req, res) => {
  const { months, clientId } = req.query;
  const report = await reportService.getTrendReport({ months, clientId });
  sendSuccess(res, { data: report });
});

const userLogs = asyncHandler(async (req, res) => {
  // Accept both `action` (what the User Logs page actually sends) and
  // `logType` (the CONTRACT.md/PAGES.md naming) as the same filter.
  const { page, limit, userId, formName, action, logType, actionDescription, refNo, fromDate, toDate } = req.query;
  const { items, total, page: p, limit: l } = await reportService.getUserLogs({
    page,
    limit,
    userId,
    formName,
    logType: logType || action,
    actionDescription,
    refNo,
    fromDate,
    toDate
  });
  sendList(res, { data: items, pagination: buildPagination({ page: p, limit: l, total }) });
});

const clientOutstanding = asyncHandler(async (req, res) => {
  const { fromDate, toDate, clientId } = req.query;
  const report = await reportService.getClientOutstanding({ fromDate, toDate, clientId });
  sendSuccess(res, { data: report });
});

module.exports = { salesReport, bookingSummary, vendorContribution, trendReport, userLogs, clientOutstanding };
