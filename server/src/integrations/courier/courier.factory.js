const BlueDartProvider = require('./bluedart/bluedart.provider');
const DtdcProvider = require('./dtdc/dtdc.provider');
const FedexProvider = require('./fedex/fedex.provider');
const DhlProvider = require('./dhl/dhl.provider');
const MockCourierProvider = require('./mock/mock.provider');

// One entry per real, brand-specific integration. Anything not listed here (including an
// explicit "MOCK" vendorCode, or any vendor whose code we don't recognize) falls back to
// MockCourierProvider — see getCourierProvider() below — so the forwarding pipeline is always
// exercisable even before a given vendor's real API is implemented.
const PROVIDERS = {
  BLUEDART: { Provider: BlueDartProvider, envPrefix: 'BLUEDART' },
  DTDC: { Provider: DtdcProvider, envPrefix: 'DTDC' },
  FEDEX: { Provider: FedexProvider, envPrefix: 'FEDEX' },
  DHL: { Provider: DhlProvider, envPrefix: 'DHL' }
};

function buildConfig(envPrefix, vendor) {
  return {
    apiUrl: process.env[`${envPrefix}_API_URL`] || vendor?.apiUrl || '',
    apiKey: process.env[`${envPrefix}_API_KEY`] || vendor?.apiKey || '',
    clientId: process.env[`${envPrefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`] || '',
    timeout: Number(process.env.COURIER_API_TIMEOUT) || 30000
  };
}

/**
 * Resolves a Vendor document to a CourierProvider instance. `vendor.vendorCode` (uppercased,
 * trimmed) selects the provider; unrecognized codes get the mock provider rather than an
 * error, so any vendor record works end-to-end today. Vendor.apiUrl/apiKey (the fields already
 * on the Vendor model) are used as a per-vendor fallback under the matching *_API_URL/*_API_KEY
 * env vars, which take precedence when set.
 */
function getCourierProvider(vendor) {
  const code = (vendor?.vendorCode || '').trim().toUpperCase();
  const entry = PROVIDERS[code];

  if (!entry) {
    return new MockCourierProvider({ vendorCode: code || 'MOCK' });
  }

  return new entry.Provider(buildConfig(entry.envPrefix, vendor));
}

module.exports = { getCourierProvider, PROVIDERS };
