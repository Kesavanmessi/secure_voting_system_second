// seedAdmin.js
require('dotenv').config();
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const seedAdminData = async () => {
  const username = "Kesavan";
  const password = "kesavan@123";
  const role = "Head Admin";
  const adminId = "headadmin001";

  // Remove all existing Head Admins
  await Admin.deleteMany({ role: 'Head Admin' });

  // Check if Head Admin already exists (shouldn't after delete, but for safety)
  const exists = await Admin.findOne({ username, role });
  if (!exists) {
    const admin = new Admin({
      username,
      password,
      role,
      adminId
    });
    await admin.save();
    console.log("Head Admin seeded successfully");
  } else {
    console.log("Head Admin already exists");
  }
};

// Connect then seed
connectDB()
  .then(() => seedAdminData())
  .then(() => {
    // Close mongoose connection after done
    return require('mongoose').connection.close();
  })
  .catch(error => {
    console.error('Error seeding admin data:', error);
    try { require('mongoose').connection.close(); } catch (e) {}
    process.exit(1);
  });
