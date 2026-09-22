/**
 * PENDING — no BlueDart API documentation or credentials are available in this project.
 * Once BlueDart's actual request/response field names are known, implement:
 *   toBlueDartRequest(shipment) -> vendor-shaped booking request body
 *   fromBlueDartResponse(raw)   -> standard shape (see courier.provider.js doc comment)
 * Do not guess field names — see bluedart.provider.js.
 */
function toBlueDartRequest() {
  throw new Error('BlueDart request mapping is not implemented — pending API documentation.');
}

function fromBlueDartResponse() {
  throw new Error('BlueDart response mapping is not implemented — pending API documentation.');
}

module.exports = { toBlueDartRequest, fromBlueDartResponse };
