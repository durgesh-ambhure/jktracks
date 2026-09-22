/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const env = require('../config/env');
const Role = require('../models/Role');
const User = require('../models/User');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const { ROLE_PERMISSIONS } = require('./permissions');
const { computeShipmentCharges } = require('../services/shipmentChargeService');
const { generateAwbNo } = require('../services/awbService');

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
];

const STATUSES = Shipment.SHIPMENT_STATUSES || [
  'BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB', 'HANDOVER TO CARRIER',
  'OUT FOR DELIVERY', 'DELIVERED', 'UN-DELIVERED', 'RTO', 'HOLD AT CUSTOM', 'CANCELLED'
];

const PAYMENT_TYPES = ['CASH', 'COD', 'CREDIT', 'WALLET'];
const BUSINESS_TYPES = ['B2B', 'B2C', 'C2C'];
const PACKET_TYPES = ['DOX', 'SPX'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// Event chain per terminal status — approximates a realistic movement
// history so Tracking timelines look real.
const EVENT_CHAINS = {
  BOOKED: ['BOOKED'],
  'PICKED UP': ['BOOKED', 'PICKED UP'],
  INTRANSIT: ['BOOKED', 'PICKED UP', 'INTRANSIT'],
  ARRIVED: ['BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED'],
  'PACKET AT HUB': ['BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB'],
  'HANDOVER TO CARRIER': ['BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB', 'HANDOVER TO CARRIER'],
  'OUT FOR DELIVERY': ['BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB', 'HANDOVER TO CARRIER', 'OUT FOR DELIVERY'],
  DELIVERED: ['BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB', 'HANDOVER TO CARRIER', 'OUT FOR DELIVERY', 'DELIVERED'],
  'UN-DELIVERED': ['BOOKED', 'PICKED UP', 'INTRANSIT', 'OUT FOR DELIVERY', 'UN-DELIVERED'],
  RTO: ['BOOKED', 'PICKED UP', 'INTRANSIT', 'OUT FOR DELIVERY', 'UN-DELIVERED', 'RTO'],
  'HOLD AT CUSTOM': ['BOOKED', 'PICKED UP', 'INTRANSIT', 'HOLD AT CUSTOM'],
  CANCELLED: ['BOOKED', 'CANCELLED']
};

async function seedRoles() {
  const results = [];
  for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await Role.findOneAndUpdate(
      { name },
      { name, permissions, isSystem: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(role);
  }
  console.log(`[seed] roles ready: ${results.map((r) => r.name).join(', ')}`);
  return results;
}

async function seedUsers() {
  const demoUsers = [
    {
      userCode: '3490',
      name: 'Super Admin',
      email: 'admin@courierms.local',
      password: 'Admin@123',
      role: 'SUPER_ADMIN'
    },
    {
      userCode: '3491',
      name: 'Krunal Nathvani',
      email: 'admin.demo@courierms.local',
      password: 'Demo@123',
      role: 'ADMIN'
    },
    {
      userCode: '3492',
      name: 'Staff Demo',
      email: 'staff.demo@courierms.local',
      password: 'Demo@123',
      role: 'STAFF'
    }
  ];

  const created = [];
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await User.findOneAndUpdate(
      { email: u.email },
      {
        userCode: u.userCode,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        companyCode: 'CM2813',
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created.push({ ...u, id: user._id });
  }

  console.log('[seed] demo users ready — credentials:');
  demoUsers.forEach((u) => console.log(`         ${u.role.padEnd(12)} email: ${u.email}   password: ${u.password}`));

  return created;
}

async function seedCustomers() {
  const existing = await Client.countDocuments({});
  if (existing >= 8) {
    console.log(`[seed] customers already present (${existing}), skipping`);
    return Client.find({}).limit(8);
  }

  const names = [
    'Acme Traders', 'Blue Ocean Exports', 'Sunrise Textiles', 'Nova Pharma Pvt Ltd',
    'Global Gadgets', 'Prime Foods Ltd', 'Metro Electronics', 'Everest Logistics Clients'
  ];

  const docs = names.map((name, i) => {
    const loc = pick(CITIES);
    return {
      clientCode: `CL${String(i + 1).padStart(5, '0')}`,
      name,
      contactPerson: `Contact ${i + 1}`,
      email: `contact${i + 1}@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `98${randomInt(10000000, 99999999)}`,
      address1: `${randomInt(1, 200)}, MG Road`,
      address2: 'Near City Center',
      city: loc.city,
      state: loc.state,
      country: 'India',
      pincode: loc.pincode,
      gstin: `27ABCDE${1000 + i}F1Z${i}`,
      pan: `ABCDE${1000 + i}F`,
      creditLimit: randomInt(50000, 500000),
      status: 'ACTIVE'
    };
  });

  const created = await Client.insertMany(docs);
  console.log(`[seed] created ${created.length} customers`);
  return created;
}

async function seedVendors() {
  const existing = await Vendor.countDocuments({});
  if (existing >= 5) {
    console.log(`[seed] vendors already present (${existing}), skipping`);
    return Vendor.find({}).limit(5);
  }

  const vendors = [
    { name: 'FedEx Express', code: 'FDX' },
    { name: 'DHL International', code: 'DHL' },
    { name: 'Blue Dart Aviation', code: 'BDA' },
    { name: 'Aramex India', code: 'ARX' },
    { name: 'DTDC Courier', code: 'DTC' }
  ];

  const docs = vendors.map((v, i) => ({
    vendorCode: `VN${String(i + 1).padStart(4, '0')}`,
    name: v.name,
    apiUrl: `https://api.${v.code.toLowerCase()}.example.com`,
    apiKey: `demo-api-key-${v.code.toLowerCase()}-${randomInt(1000, 9999)}`,
    status: 'ACTIVE',
    serviceTypes: [
      { name: 'Express', code: `${v.code}-EXP` },
      { name: 'Standard', code: `${v.code}-STD` }
    ],
    trackingEnabled: true
  }));

  const created = await Vendor.insertMany(docs);
  console.log(`[seed] created ${created.length} vendors`);
  return created;
}

function randomParty(loc) {
  return {
    name: `Person ${randomInt(1, 9999)}`,
    contactPerson: `Contact ${randomInt(1, 9999)}`,
    address1: `${randomInt(1, 300)}, Sector ${randomInt(1, 20)}`,
    address2: 'Business Park',
    address3: '',
    pincode: loc.pincode,
    country: 'India',
    state: loc.state,
    city: loc.city,
    phone: `9${randomInt(100000000, 999999999)}`,
    phone2: '',
    email: `party${randomInt(1, 9999)}@example.com`,
    pan: '',
    gstin: '',
    iec: '',
    aadhaarNo: ''
  };
}

async function seedShipments(customers, vendors, users) {
  const existing = await Shipment.countDocuments({});
  if (existing >= 50) {
    console.log(`[seed] shipments already present (${existing}), skipping shipment/event seed`);
    return;
  }

  const targetCount = 60;
  const createdBy = users.find((u) => u.role === 'ADMIN') || users[0];

  let insertedCount = 0;

  for (let i = 0; i < targetCount; i += 1) {
    const status = pick(STATUSES);
    const paymentType = pick(PAYMENT_TYPES);
    const originLoc = pick(CITIES);
    const destLoc = pick(CITIES);
    const client = pick(customers);
    const vendor = pick(vendors);
    const bookingDaysAgo = randomInt(0, 180); // spread across ~6 months for revenue trend

    const boxes = [
      {
        length: randomInt(10, 60),
        width: randomInt(10, 60),
        height: randomInt(10, 60),
        pcs: 1,
        actualWeight: randomInt(1, 20),
        volumetricWeight: 0
      }
    ];

    const weightDetails = {
      pieces: 1,
      actualWeight: boxes[0].actualWeight,
      vendorWeight: boxes[0].actualWeight,
      weightUnit: 'KGS',
      totalValue: randomInt(1000, 50000),
      valueCurrency: 'INR',
      divisor: 5000,
      isVolumetric: true,
      boxes
    };

    const awbNo = await generateAwbNo();

    const shipmentPayload = {
      awbNo,
      refNo: `REF${randomInt(100000, 999999)}`,
      bookingDate: daysAgo(bookingDaysAgo),
      clientId: client._id,
      businessType: pick(BUSINESS_TYPES),
      consignor: randomParty(originLoc),
      consignee: randomParty(destLoc),
      packetType: pick(PACKET_TYPES),
      paymentType,
      amount: randomInt(500, 15000),
      currency: 'INR',
      invoiceNo: `INV${randomInt(10000, 99999)}`,
      packetDescription: 'General merchandise',
      invoiceDescription: 'Commercial shipment',
      weightDetails,
      forwarding: {
        vendorId: vendor._id,
        serviceType: pick(vendor.serviceTypes)?.name || 'Standard',
        packaging: 'Box',
        forwardingNo1: `FWD${randomInt(100000, 999999)}`,
        forwardingNo2: '',
        vendorAccountNo: `ACC${randomInt(1000, 9999)}`,
        dutiesAccountNo: '',
        billDutiesTo: 'SENDER',
        billShipmentTo: 'SENDER',
        pickupPoint: originLoc.city,
        incoterms: 'DDU',
        shipmentPurpose: 'COMMERCIAL'
      },
      status,
      isCancelled: status === 'CANCELLED',
      cancellationReason: status === 'CANCELLED' ? 'Customer requested cancellation' : '',
      operationRemarks: '',
      accountingRemarks: '',
      createdBy: createdBy.id
    };

    const { clientCharges, vendorCharges } = computeShipmentCharges(shipmentPayload);
    shipmentPayload.clientCharges = clientCharges;
    shipmentPayload.vendorCharges = vendorCharges;

    const shipment = await Shipment.create(shipmentPayload);
    insertedCount += 1;

    // Build a matching ShipmentEvent timeline for this shipment's status.
    const chain = EVENT_CHAINS[status] || ['BOOKED'];
    const events = chain.map((evStatus, idx) => {
      const eventDate = daysAgo(Math.max(bookingDaysAgo - idx, 0));
      return {
        shipmentId: shipment._id,
        awbNo: shipment.awbNo,
        date: eventDate,
        time: `${String(randomInt(8, 18)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
        status: evStatus,
        reasonCode: evStatus === 'UN-DELIVERED' ? 'ADDR_NOT_FOUND' : '',
        location: idx % 2 === 0 ? originLoc.city : destLoc.city,
        statusDetails: `Auto-seeded event: ${evStatus}`,
        createdBy: createdBy.id
      };
    });

    await ShipmentEvent.insertMany(events);
  }

  console.log(`[seed] created ${insertedCount} shipments with matching event timelines`);
}

async function run() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[seed] connected to ${env.MONGODB_URI}`);

  await seedRoles();
  const users = await seedUsers();
  const customers = await seedCustomers();
  const vendors = await seedVendors();
  await seedShipments(customers, vendors, users);

  console.log('[seed] done. Safe to re-run — roles/users are upserted, customers/vendors/shipments skip once minimum counts exist.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
