/**
 * Common contract for GST e-Invoice IRN generation — mirrors courier/courier.provider.js's
 * role for the shipment-forwarding integration. irnGeneration.service.js talks only to this
 * interface via irn.factory.js.
 *
 * generateIrn(invoicePayload) resolves to:
 *   { success, irn, ackNo, ackDate, signedQrCode, status, message, rawResponse }
 * cancelIrn(irn, reason) resolves to:
 *   { success, message, rawResponse }
 *
 * `invoicePayload` is expected to already be shaped close to the government's INV-01 e-Invoice
 * schema (seller/buyer GSTIN, line items with HSN codes, tax breakup, etc.) — that mapping is
 * the responsibility of the concrete provider (see nic/nic.irn.provider.js).
 */
class IrnProvider {
  // eslint-disable-next-line class-methods-use-this
  async generateIrn(/* invoicePayload */) {
    throw new Error('generateIrn() not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelIrn(/* irn, reason */) {
    throw new Error('cancelIrn() not implemented');
  }
}

module.exports = IrnProvider;
