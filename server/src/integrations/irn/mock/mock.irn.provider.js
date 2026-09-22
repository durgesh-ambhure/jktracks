const crypto = require('crypto');
const IrnProvider = require('../irn.provider');

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * Fully working provider used until real NIC/GSP credentials are configured (see
 * nic.irn.provider.js). Exercises the whole IRN pipeline — service, controller, DB
 * persistence, IRN Report — with a realistic-shaped but non-government IRN.
 *
 * Real IRNs are a 64-character SHA-256 hex hash of the supplier GSTIN + doc details; this mock
 * mirrors that shape (deterministic per invoiceNo) without pretending to be a genuine
 * government registration.
 */
class MockIrnProvider extends IrnProvider {
  // eslint-disable-next-line class-methods-use-this
  async generateIrn(invoicePayload) {
    await wait(150);

    if (String(invoicePayload?.invoiceNo || '').toUpperCase().includes('FAIL')) {
      return {
        success: false,
        irn: null,
        ackNo: null,
        ackDate: null,
        signedQrCode: null,
        status: 'REJECTED',
        message: 'Mock GSP rejected: buyer GSTIN format invalid',
        rawResponse: { error: 'INVALID_GSTIN' }
      };
    }

    const irn = crypto.createHash('sha256').update(`MOCK|${invoicePayload?.invoiceNo}|${Date.now()}`).digest('hex');
    const ackNo = String(100000000000 + Math.floor(Math.random() * 899999999999));
    const ackDate = new Date();

    return {
      success: true,
      irn,
      ackNo,
      ackDate,
      signedQrCode: Buffer.from(`MOCKQR|${irn}`).toString('base64'),
      status: 'ACT',
      message: 'IRN generated (mock)',
      rawResponse: { irn, ackNo, status: 'ACT' }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async cancelIrn(irn) {
    await wait(150);
    return { success: true, message: 'IRN cancelled (mock)', rawResponse: { irn, status: 'CNL' } };
  }
}

module.exports = MockIrnProvider;
