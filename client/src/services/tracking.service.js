import api, { unwrap } from './api';

const trackingService = {
  trackByAwb: (awb) => unwrap(api.get(`/tracking/${encodeURIComponent(awb)}`)),
};

export default trackingService;
