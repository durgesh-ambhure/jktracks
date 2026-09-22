const IrnProvider = require('../irn.provider');

/**
 * PENDING IMPLEMENTATION — no GST e-Invoice API documentation or credentials are available in
 * this project. Real IRN generation goes either through the NIC Invoice Registration Portal
 * (IRP) directly, or through a GSP (GST Suvidha Provider — a commercial intermediary), both of
 * which require enrolling a real GSTIN and obtaining API credentials (see
 * server/.env.example: GST_IRN_API_URL / GST_IRN_CLIENT_ID / GST_IRN_CLIENT_SECRET /
 * GST_IRN_USERNAME / GST_IRN_PASSWORD).
 *
 * The government's e-Invoice request/response schema (INV-01) IS public, so the request
 * mapping can be built for real once this provider is implemented — but the auth flow, base
 * URL and account are account-specific and were not guessed or fabricated here.
 *
 * Until GST_IRN_* env vars are set, irn.factory.js routes every invoice through
 * MockIrnProvider instead of this class.
 */
class NicIrnProvider extends IrnProvider {
  // eslint-disable-next-line class-methods-use-this
  async generateIrn() {
    throw new Error('GST e-Invoice IRN generation is not implemented — pending NIC/GSP API documentation and credentials.');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelIrn() {
    throw new Error('GST e-Invoice IRN cancellation is not implemented — pending NIC/GSP API documentation and credentials.');
  }
}

module.exports = NicIrnProvider;
