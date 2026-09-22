const CourierProvider = require('../courier.provider');

/**
 * PENDING IMPLEMENTATION — FedEx's official API documentation and credentials were not
 * available in this project (see server/.env.example: FEDEX_API_URL / FEDEX_CLIENT_ID /
 * FEDEX_CLIENT_SECRET). Per the integration rule, no endpoint, auth method, request body or
 * response shape has been guessed or fabricated.
 *
 * To finish this provider: read FedEx's booking/tracking/label API docs, fill in
 * authenticate()/createShipment()/cancelShipment()/trackShipment()/generateLabel() using
 * fedex.mapper.js to convert to/from the shapes described in courier.provider.js, and set the
 * FEDEX_* variables in .env. Until then, courier.factory.js will only reach this class for a
 * Vendor whose vendorCode is exactly "FEDEX" — every method below throws clearly rather than
 * silently no-op-ing or faking a booking.
 */
class FedexProvider extends CourierProvider {
  // eslint-disable-next-line class-methods-use-this
  async authenticate() {
    throw new Error('FedEx integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async createShipment() {
    throw new Error('FedEx integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelShipment() {
    throw new Error('FedEx integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async trackShipment() {
    throw new Error('FedEx integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async generateLabel() {
    throw new Error('FedEx integration is not implemented — pending API documentation and credentials.');
  }
}

module.exports = FedexProvider;
