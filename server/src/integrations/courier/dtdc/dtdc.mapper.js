/**
 * PENDING — no DTDC API documentation or credentials are available in this project.
 * Once DTDC's actual request/response field names are known, implement:
 *   toDtdcRequest(shipment) -> vendor-shaped booking request body
 *   fromDtdcResponse(raw)   -> standard shape (see courier.provider.js doc comment)
 * Do not guess field names — see dtdc.provider.js.
 */
function toDtdcRequest() {
  throw new Error('DTDC request mapping is not implemented — pending API documentation.');
}

function fromDtdcResponse() {
  throw new Error('DTDC response mapping is not implemented — pending API documentation.');
}

module.exports = { toDtdcRequest, fromDtdcResponse };
