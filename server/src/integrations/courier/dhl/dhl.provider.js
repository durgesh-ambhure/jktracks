const CourierProvider = require('../courier.provider');

/**
 * PENDING IMPLEMENTATION — DHL's official API documentation and credentials were not
 * available in this project (see server/.env.example: DHL_API_URL / DHL_API_KEY). Per the
 * integration rule, no endpoint, auth method, request body or response shape has been guessed
 * or fabricated.
 *
 * To finish this provider: read DHL's booking/tracking/label API docs, fill in
 * authenticate()/createShipment()/cancelShipment()/trackShipment()/generateLabel() using
 * dhl.mapper.js to convert to/from the shapes described in courier.provider.js, and set the
 * DHL_* variables in .env. Until then, courier.factory.js will only reach this class for a
 * Vendor whose vendorCode is exactly "DHL" — every method below throws clearly rather than
 * silently no-op-ing or faking a booking.
 */
class DhlProvider extends CourierProvider {
  // eslint-disable-next-line class-methods-use-this
  async authenticate() {
    throw new Error('DHL integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async createShipment() {
    throw new Error('DHL integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelShipment() {
    throw new Error('DHL integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async trackShipment() {
    throw new Error('DHL integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async generateLabel() {
    throw new Error('DHL integration is not implemented — pending API documentation and credentials.');
  }
}

module.exports = DhlProvider;
