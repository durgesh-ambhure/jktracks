import api, { unwrap } from './api';

const customerService = {
  list: (params) => unwrap(api.get('/customers', { params })),
  get: (id) => unwrap(api.get(`/customers/${id}`)),
  create: (payload) => unwrap(api.post('/customers', payload)),
  update: (id, payload) => unwrap(api.patch(`/customers/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/customers/${id}`)),
};

export default customerService;
