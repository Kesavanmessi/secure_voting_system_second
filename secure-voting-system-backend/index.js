const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes')
const cors = require('cors');

// Import the scheduler
const startScheduler = require('./scheduler');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Enables JSON body parsing

const electionRoutes = require('./routes/electionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Mount routes
app.use('/api/auth', authRoutes); // For all authentication-related endpoints
app.use('/api/admins', adminRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/elections', resultRoutes);
app.use('/api/upload', uploadRoutes); // New upload routes
// Start the scheduler after DB connection
startScheduler(); // This will initialize the scheduler and start it in the background

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
