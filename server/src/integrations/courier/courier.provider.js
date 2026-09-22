/**
 * Common contract every courier/vendor integration must implement. Shipment business logic
 * (shipmentForwarding.service.js) talks only to this interface via courier.factory.js — it
 * never knows which concrete vendor it's talking to, so adding a new courier later means
 * adding one new provider class, not touching the shipment module.
 *
 * Every method must return the STANDARD shapes described below (never a raw vendor payload)
 * so the rest of the app stays vendor-independent — see shipmentForwarding.service.js for how
 * these are persisted onto Shipment.courierForwarding.
 *
 * createShipment(shipment) resolves to:
 *   {
 *     success: boolean,
 *     vendorShipmentId: string|null,
 *     awbNumber: string|null,      // the AWB the VENDOR assigned (not our own awbNo)
 *     trackingNumber: string|null,
 *     labelUrl: string|null,
 *     status: string|null,         // raw vendor status string, e.g. "BOOKED"
 *     message: string,
 *     rawResponse: object|null     // sanitized — no secrets, reasonably small
 *   }
 *
 * trackShipment(trackingNumber) resolves to the same shape (awbNumber/labelUrl may be null).
 * cancelShipment(shipment) resolves to { success, message, rawResponse }.
 * generateLabel(shipment) resolves to { success, labelUrl, message }.
 */
class CourierProvider {
  constructor(config = {}) {
    this.config = config;
  }

  // eslint-disable-next-line class-methods-use-this
  async authenticate() {
    throw new Error('authenticate() not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async createShipment(/* shipment */) {
    throw new Error('createShipment() not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelShipment(/* shipment */) {
    throw new Error('cancelShipment() not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async trackShipment(/* trackingNumber */) {
    throw new Error('trackShipment() not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async generateLabel(/* shipment */) {
    throw new Error('generateLabel() not implemented');
  }
}

module.exports = CourierProvider;
