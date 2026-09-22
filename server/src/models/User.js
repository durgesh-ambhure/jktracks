const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    // Not a Mongoose enum — role names are no longer a fixed set (see User Group / Role.js).
    // Existence is checked against the Role collection in userController.js instead.
    role: { type: String, required: true, trim: true, uppercase: true },
    companyCode: { type: String, default: 'CM2813' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // Per-user permission additions on top of their role's permission set
    // (powers the "User Rights" page). Role-level changes live on Role.permissions
    // ("Group Rights" page) instead. Effective permissions = union of both.
    permissionOverrides: { type: [String], default: [] }
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
