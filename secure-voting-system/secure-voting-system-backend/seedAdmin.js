// seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // Adjust path as necessary

mongoose.connect('mongodb://localhost:27017/secureVotingDB');

const seedAdminData = async () => {
  const username = "kesavan2";
  const password = "kesavan@123";
  const role = "Manager Admin";

  // Hash password before saving
  const admin = new Admin({
    username,
    password,
    role,
  });
  await admin.save();
  console.log("Admin data seeded successfully");
};

seedAdminData()
  .then(() => mongoose.connection.close())
  .catch(error => console.error("Error seeding admin data:", error));
