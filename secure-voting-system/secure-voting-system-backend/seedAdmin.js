// seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection error:', err));

const seedAdmin = async () => {
  try {
    // Check if an admin user with the same username already exists
    const existingAdmin = await Admin.findOne({ username: 'admin1' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // If no existing user, create a new admin
      const adminData = new Admin({
        username: 'kesavan',
        password: 'kesavan123'  // This will be hashed before saving
      });
      await adminData.save();
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
