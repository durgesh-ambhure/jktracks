const CourierProvider = require('../courier.provider');

/**
 * PENDING IMPLEMENTATION — BlueDart's official API documentation and credentials were not
 * available in this project (see server/.env.example: BLUEDART_API_URL / BLUEDART_CLIENT_ID /
 * BLUEDART_CLIENT_SECRET / BLUEDART_API_KEY). Per the integration rule, no endpoint, auth
 * method, request body or response shape has been guessed or fabricated.
 *
 * To finish this provider: read BlueDart's booking/tracking/label API docs, fill in
 * authenticate()/createShipment()/cancelShipment()/trackShipment()/generateLabel() using
 * bluedart.mapper.js to convert to/from the shapes described in courier.provider.js, and set
 * the BLUEDART_* variables in .env. Until then, courier.factory.js will only reach this class
 * for a Vendor whose vendorCode is exactly "BLUEDART" — every method below throws clearly
 * rather than silently no-op-ing or faking a booking.
 */
class BlueDartProvider extends CourierProvider {
  // eslint-disable-next-line class-methods-use-this
  async authenticate() {
    throw new Error('BlueDart integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async createShipment() {
    throw new Error('BlueDart integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelShipment() {
    throw new Error('BlueDart integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async trackShipment() {
    throw new Error('BlueDart integration is not implemented — pending API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async generateLabel() {
    throw new Error('BlueDart integration is not implemented — pending API documentation and credentials.');
  }
}

module.exports = BlueDartProvider;
