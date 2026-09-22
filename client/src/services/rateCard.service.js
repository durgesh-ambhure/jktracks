import api, { unwrap } from './api';
import { createGenericService } from './generic.service';

/**
 * Real Mongoose-backed resources (RateCard, ClientTaxRate, VendorFuelSurcharge,
 * VendorServiceConfig, VendorAccount, ClientVas, VendorApiLog — server/src/models/), NOT the
 * GenericRecord Tier-2 shortcut. They share the same standard REST list/get/create/update/
 * remove shape as the Tier-2 services, so createGenericService's thin axios wrapper is reused
 * for the mechanical part.
 */

// partyType: 'VENDOR' | 'CLIENT' — passed as a list() query param, e.g.
// rateCardService.list({ partyType: 'VENDOR' }).
export const rateCardService = createGenericService('/rate-cards');
export const clientTaxRateService = createGenericService('/tax-rates');
export const vendorFuelSurchargeService = createGenericService('/fuel-surcharges');
export const vendorServiceConfigService = createGenericService('/service-configs');
export const vendorAccountService = createGenericService('/vendor-accounts');
export const clientVasService = createGenericService('/client-vas');
export const vendorApiLogService = createGenericService('/vendor-api-logs');

export const ratecalService = {
  compare: (zone, weight) => unwrap(api.post('/ratecal/compare', { zone, weight })),
};
