import api, { unwrap } from './api';

const shipmentService = {
  list: (params) => unwrap(api.get('/shipments', { params })),
  get: (id) => unwrap(api.get(`/shipments/${id}`)),
  create: (payload) => unwrap(api.post('/shipments', payload)),
  update: (id, payload) => unwrap(api.patch(`/shipments/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/shipments/${id}`)),
  cancel: (id, reason) => unwrap(api.post(`/shipments/${id}/cancel`, { reason })),
  exportCsv: (params) => api.get('/shipments/export', { params, responseType: 'blob' }),
  listEvents: (id) => unwrap(api.get(`/shipments/${id}/events`)),
  addEvent: (id, payload) => unwrap(api.post(`/shipments/${id}/events`, payload)),
};

export default shipmentService;
