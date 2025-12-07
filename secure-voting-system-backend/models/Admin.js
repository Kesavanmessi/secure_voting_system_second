// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Head Admin', 'Manager Admin'],
    default: 'Manager Admin'
  },
  permissions: {
    type: [String], // Array of permissions, e.g., ["manageElections", "viewReports"]
    default: []     // Default permissions, based on the role
  }
});

// Middleware to hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Function to set default permissions based on role
AdminSchema.pre('save', function (next) {
  if (!this.isModified('role')) return next();

  // Assign default permissions based on role
  switch (this.role) {
    case 'Head Admin':
      this.permissions = ['manageElections', 'viewReports', 'manageAdmins', 'viewVoters'];
      break;
    case 'Manager Admin':
      this.permissions = ['manageElections', 'viewReports'];
      break;
  }
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
