const mongoose = require('mongoose');

// The 5 seeded roles (isSystem: true) — always present, cannot be renamed/deleted. Custom
// groups created via "User Group" (client/src/pages/users/UserGroupPage.jsx) get isSystem:
// false and can be freely created/deleted as long as no user is still assigned to them.
const ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, uppercase: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true }
);

roleSchema.statics.ROLE_NAMES = ROLE_NAMES;

module.exports = mongoose.model('Role', roleSchema);
module.exports.ROLE_NAMES = ROLE_NAMES;
