const { nextSequence } = require('../models/Counter');

// Same pattern as awbService.generateAwbNo — sequential, prefixed invoice numbers, e.g. INV100001.
async function generateInvoiceNo() {
  const seq = await nextSequence('invoiceNo');
  const padded = String(100000 + seq);
  return `INV${padded}`;
}

module.exports = { generateInvoiceNo };
