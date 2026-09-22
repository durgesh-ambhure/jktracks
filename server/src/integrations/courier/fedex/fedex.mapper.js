/**
 * PENDING — no FedEx API documentation or credentials are available in this project.
 * Once FedEx's actual request/response field names are known, implement:
 *   toFedexRequest(shipment) -> vendor-shaped booking request body
 *   fromFedexResponse(raw)   -> standard shape (see courier.provider.js doc comment)
 * Do not guess field names — see fedex.provider.js.
 */
function toFedexRequest() {
  throw new Error('FedEx request mapping is not implemented — pending API documentation.');
}

function fromFedexResponse() {
  throw new Error('FedEx response mapping is not implemented — pending API documentation.');
}

module.exports = { toFedexRequest, fromFedexResponse };
