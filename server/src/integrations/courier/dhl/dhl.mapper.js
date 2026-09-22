/**
 * PENDING — no DHL API documentation or credentials are available in this project.
 * Once DHL's actual request/response field names are known, implement:
 *   toDhlRequest(shipment) -> vendor-shaped booking request body
 *   fromDhlResponse(raw)   -> standard shape (see courier.provider.js doc comment)
 * Do not guess field names — see dhl.provider.js.
 */
function toDhlRequest() {
  throw new Error('DHL request mapping is not implemented — pending API documentation.');
}

function fromDhlResponse() {
  throw new Error('DHL response mapping is not implemented — pending API documentation.');
}

module.exports = { toDhlRequest, fromDhlResponse };
