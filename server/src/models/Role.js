const mongoose = require('mongoose');

const ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, enum: ROLE_NAMES },
    permissions: { type: [String], default: [] }
  },
  { timestamps: true }
);

roleSchema.statics.ROLE_NAMES = ROLE_NAMES;

module.exports = mongoose.model('Role', roleSchema);
module.exports.ROLE_NAMES = ROLE_NAMES;
