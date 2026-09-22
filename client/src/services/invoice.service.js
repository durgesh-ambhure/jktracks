import api, { unwrap } from './api';

// Real Invoice resource (server/src/models/Invoice.js) — replaces the old GenericRecord-backed
// invoicesService for the actual bill-generation endpoints (list/get/create/regenerate/remove).
const invoiceService = {
  list: (params) => unwrap(api.get('/invoices', { params })),
  get: (id) => unwrap(api.get(`/invoices/${id}`)),
  create: (payload) => unwrap(api.post('/invoices', payload)),
  regenerate: (id, reason) => unwrap(api.post(`/invoices/${id}/regenerate`, { reason })),
  generateIrn: (id) => unwrap(api.post(`/invoices/${id}/generate-irn`)),
  cancelIrn: (id, reason) => unwrap(api.post(`/invoices/${id}/cancel-irn`, { reason })),
  remove: (id) => unwrap(api.delete(`/invoices/${id}`)),
};

export default invoiceService;
