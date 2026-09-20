const { nextSequence } = require('../models/Counter');

// Auto-generates sequential, prefixed AWB numbers, e.g. JKT100001.
// Uniqueness is additionally enforced by the schema's unique index.
async function generateAwbNo() {
  const seq = await nextSequence('awbNo');
  const padded = String(100000 + seq);
  return `JKT${padded}`;
}

module.exports = { generateAwbNo };
