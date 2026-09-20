import api, { unwrap } from './api';

const dashboardService = {
  getSummary: () => unwrap(api.get('/dashboard/summary')),
};

export default dashboardService;
