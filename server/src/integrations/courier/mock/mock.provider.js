const CourierProvider = require('../courier.provider');

const LATENCY_MS = 150;
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * Fully working provider used when a Vendor record's code doesn't map to a real, implemented
 * integration (see courier.factory.js). Exercises the entire forwarding pipeline — controller,
 * service, mapper, response handling, DB persistence, audit log — without any real vendor
 * credentials, which is what lets this feature be used/demoed today.
 *
 * The outcome is deterministic and picked from the shipment's own refNo so a specific failure
 * mode can be reproduced on demand (no test framework was wired up for this pass — this is the
 * manual substitute): refNo containing (case-insensitive) "TIMEOUT" / "VALIDATION_ERROR" /
 * "SERVER_ERROR" simulates that outcome; anything else simulates SUCCESS.
 */
class MockCourierProvider extends CourierProvider {
  // eslint-disable-next-line class-methods-use-this
  async authenticate() {
    await wait(LATENCY_MS);
    return { token: 'mock-token', expiresIn: 3600 };
  }

  // eslint-disable-next-line class-methods-use-this
  async createShipment(shipment) {
    const scenario = pickScenario(shipment);
    await wait(LATENCY_MS);

    if (scenario === 'TIMEOUT') {
      const err = new Error('Mock vendor request timed out');
      err.code = 'ECONNABORTED';
      throw err;
    }

    if (scenario === 'VALIDATION_ERROR') {
      return {
        success: false,
        vendorShipmentId: null,
        awbNumber: null,
        trackingNumber: null,
        labelUrl: null,
        status: 'REJECTED',
        message: 'Vendor rejected shipment: invalid destination pincode',
        rawResponse: { error: 'INVALID_PINCODE', field: 'consignee.pincode' }
      };
    }

    if (scenario === 'SERVER_ERROR') {
      const err = new Error('Mock vendor server error');
      err.response = { status: 500, data: { error: 'INTERNAL_ERROR' } };
      throw err;
    }

    const vendorShipmentId = `MOCK-${Date.now()}`;
    const vendorAwb = `MK${Math.floor(100000000 + Math.random() * 899999999)}`;
    return {
      success: true,
      vendorShipmentId,
      awbNumber: vendorAwb,
      trackingNumber: vendorAwb,
      labelUrl: `https://mock-courier.local/labels/${vendorAwb}.pdf`,
      status: 'BOOKED',
      message: 'Shipment booked successfully',
      rawResponse: { vendorShipmentId, awb: vendorAwb, status: 'BOOKED' }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelShipment(shipment) {
    await wait(LATENCY_MS);
    return {
      success: true,
      message: 'Shipment cancelled with vendor',
      rawResponse: { vendorShipmentId: shipment.courierForwarding?.vendorShipmentId, status: 'CANCELLED' }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async trackShipment(trackingNumber) {
    await wait(LATENCY_MS);
    return {
      success: true,
      vendorShipmentId: null,
      awbNumber: trackingNumber,
      trackingNumber,
      labelUrl: null,
      status: 'IN_TRANSIT',
      message: 'OK',
      rawResponse: { trackingNumber, status: 'IN_TRANSIT' }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async generateLabel(shipment) {
    await wait(LATENCY_MS);
    const awb = shipment.courierForwarding?.vendorAwbNumber || 'UNKNOWN';
    return { success: true, labelUrl: `https://mock-courier.local/labels/${awb}.pdf`, message: 'OK' };
  }
}

function pickScenario(shipment) {
  const marker = (shipment?.refNo || '').toUpperCase();
  if (marker.includes('TIMEOUT')) return 'TIMEOUT';
  if (marker.includes('VALIDATION_ERROR')) return 'VALIDATION_ERROR';
  if (marker.includes('SERVER_ERROR')) return 'SERVER_ERROR';
  return 'SUCCESS';
}

module.exports = MockCourierProvider;
