import api, { unwrap } from './api';

const userService = {
  list: (params) => unwrap(api.get('/users', { params })),
  get: (id) => unwrap(api.get(`/users/${id}`)),
  create: (payload) => unwrap(api.post('/users', payload)),
  update: (id, payload) => unwrap(api.patch(`/users/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/users/${id}`)),
  roles: () => unwrap(api.get('/roles')),
};

export default userService;
