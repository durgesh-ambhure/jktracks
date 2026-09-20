import api, { unwrap } from './api';

const courierService = {
  list: (params) => unwrap(api.get('/couriers', { params })),
  get: (id) => unwrap(api.get(`/couriers/${id}`)),
  create: (payload) => unwrap(api.post('/couriers', payload)),
  update: (id, payload) => unwrap(api.patch(`/couriers/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/couriers/${id}`)),
};

export default courierService;
