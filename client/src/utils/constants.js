export const SHIPMENT_STATUS_OPTIONS = [
  'BOOKED',
  'PICKED UP',
  'INTRANSIT',
  'ARRIVED',
  'PACKET AT HUB',
  'HANDOVER TO CARRIER',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'UN-DELIVERED',
  'RTO',
  'HOLD AT CUSTOM',
  'CANCELLED',
];

export const STATUS_BADGE_MAP = {
  BOOKED: 'blue',
  'PICKED UP': 'purple',
  INTRANSIT: 'amber',
  ARRIVED: 'amber',
  'PACKET AT HUB': 'amber',
  'HANDOVER TO CARRIER': 'teal',
  'OUT FOR DELIVERY': 'teal',
  DELIVERED: 'green',
  'UN-DELIVERED': 'red',
  RTO: 'red',
  'HOLD AT CUSTOM': 'red',
  CANCELLED: 'gray',
  ACTIVE: 'green',
  INACTIVE: 'gray',
};

export const BUSINESS_TYPE_OPTIONS = ['B2B', 'B2C', 'C2C'];
export const PACKET_TYPE_OPTIONS = ['DOX', 'SPX'];
export const PAYMENT_TYPE_OPTIONS = ['CASH', 'COD', 'CREDIT', 'WALLET'];
export const WEIGHT_UNIT_OPTIONS = ['KGS', 'LBS'];
export const INCOTERMS_OPTIONS = ['DDP', 'DDU'];
export const BILL_TO_OPTIONS = ['SENDER', 'RECIPIENT'];

export const REASON_CODE_OPTIONS = [
  { code: 'CONSIGNEE_NA', label: 'Consignee not available' },
  { code: 'ADDR_INCOMPLETE', label: 'Incomplete address' },
  { code: 'REFUSED', label: 'Refused by consignee' },
  { code: 'CUSTOM_HOLD', label: 'Held at customs' },
  { code: 'WEATHER', label: 'Weather delay' },
  { code: 'RESCHEDULED', label: 'Delivery rescheduled' },
  { code: 'OTHER', label: 'Other' },
];

export const ROLE_OPTIONS = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

export const PERMISSION_MODULES = [
  'dashboard',
  'shipments',
  'tracking',
  'customers',
  'couriers',
  'masters',
  'invoices',
  'payments',
  'reports',
  'import',
  'kyc',
  'accounting',
  'users',
  'settings',
];

export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'];

export const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

export const MASTER_DEFINITIONS = [
  { key: 'zones', title: 'Zone Master', fields: ['name', 'code'] },
  { key: 'charge-types', title: 'Charge Type Master', fields: ['name', 'code'] },
  { key: 'fuel-charges', title: 'Client Fuel Charge Master', fields: ['clientCode', 'percentage'] },
  { key: 'countries', title: 'Country Master', fields: ['name', 'isoCode'] },
  { key: 'states', title: 'State Master', fields: ['name', 'code', 'country'] },
  { key: 'cities', title: 'City Master', fields: ['name', 'state'] },
  { key: 'pincodes', title: 'PinCode Master', fields: ['pincode', 'city', 'state'] },
  { key: 'oda-pincode-mapping', title: 'ODA PinCode Mapping', fields: ['pincode', 'odaType'] },
  { key: 'tracking-event-mapping', title: 'Tracking Event Mapping', fields: ['vendorStatus', 'internalStatus'] },
  { key: 'reasons', title: 'Reason Master', fields: ['code', 'label'] },
  { key: 'hsn', title: 'HSN Master', fields: ['code', 'description'] },
];

export const IMPORT_DEFINITIONS = [
  { key: 'client-rate', title: 'Client Rate Import' },
  { key: 'client-rate-vendor-wise', title: 'Client Rate (Vendor-wise) Import' },
  { key: 'vendor-rate', title: 'Vendor Rate Import' },
  { key: 'vendor-rate-fedex-dhl', title: 'Vendor Rate (FedEx/DHL) Import' },
  { key: 'zone', title: 'Zone Import' },
  { key: 'vendor-pincode', title: 'Vendor PinCode Import' },
  { key: 'bulk-shipment-movement', title: 'Bulk Shipment Movement Import' },
  { key: 'oda-pincode-mapping', title: 'ODA PinCode Mapping Import' },
  { key: 'covid-charge', title: 'COVID Charge Import' },
];
