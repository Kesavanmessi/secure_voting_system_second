const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); 

const app = express();
connectDB();
app.use(cors());
app.use(express.json()); // Enables JSON body parsing

// Mount auth routes
app.use('/api/auth', authRoutes);  // <-- This must match the path in the frontend

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
