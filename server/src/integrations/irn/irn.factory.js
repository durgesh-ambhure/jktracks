const NicIrnProvider = require('./nic/nic.irn.provider');
const MockIrnProvider = require('./mock/mock.irn.provider');

// Routes to the real NIC/GSP provider only once its credentials are actually configured;
// otherwise falls back to the mock so the IRN pipeline stays exercisable. Mirrors
// courier.factory.js's fallback-to-mock behavior.
function getIrnProvider() {
  const hasRealCredentials = Boolean(process.env.GST_IRN_API_URL && (process.env.GST_IRN_API_KEY || process.env.GST_IRN_CLIENT_SECRET));
  if (hasRealCredentials) {
    return { provider: new NicIrnProvider(), providerName: 'NIC' };
  }
  return { provider: new MockIrnProvider(), providerName: 'MOCK' };
}

module.exports = { getIrnProvider };
