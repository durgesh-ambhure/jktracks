const MODULES = [
  'dashboard', 'shipments', 'tracking', 'customers', 'couriers', 'masters',
  'invoices', 'payments', 'reports', 'import', 'kyc', 'accounting', 'users', 'settings'
];
const ACTIONS = ['read', 'create', 'update', 'delete'];

function allPermissions() {
  const perms = [];
  MODULES.forEach((m) => ACTIONS.forEach((a) => perms.push(`${m}.${a}`)));
  return perms;
}

function permissionsFor(modules, actions) {
  const perms = [];
  modules.forEach((m) => actions.forEach((a) => perms.push(`${m}.${a}`)));
  return perms;
}

function readOnlyAll() {
  return MODULES.map((m) => `${m}.read`);
}

// Sensible per-role permission sets for this pass.
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: allPermissions(), // backend also short-circuits SUPER_ADMIN checks
  ADMIN: allPermissions(),
  MANAGER: [
    ...permissionsFor(
      ['shipments', 'tracking', 'customers', 'couriers', 'invoices', 'payments', 'reports', 'masters', 'kyc', 'accounting', 'import'],
      ['read', 'create', 'update']
    ),
    'dashboard.read',
    'users.read',
    'settings.read'
  ],
  STAFF: [
    ...permissionsFor(['shipments', 'tracking', 'customers'], ['read', 'create', 'update']),
    ...permissionsFor(['couriers', 'masters', 'invoices', 'payments', 'reports', 'kyc'], ['read']),
    'dashboard.read'
  ],
  VIEWER: readOnlyAll()
};

module.exports = { MODULES, ACTIONS, ROLE_PERMISSIONS, allPermissions, readOnlyAll };
