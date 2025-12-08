const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes')
const cors = require('cors');
// Security Packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Import the scheduler
const startScheduler = require('./scheduler');

const app = express();

// Required for Render/Vercel (Load Balancers)
app.set('trust proxy', 1);

// Connect to the database
connectDB();

// Middleware
app.use(helmet()); // Set secure HTTP headers
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/signup attempts
    message: 'Too many login attempts, please try again later.'
});

const electionRoutes = require('./routes/electionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Mount routes
app.use('/api/auth', authLimiter, authRoutes); // Apply strict limiter to auth
app.use('/api/admins', adminRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/elections', resultRoutes);
app.use('/api/upload', uploadRoutes); // New upload routes
// Start the scheduler after DB connection
startScheduler(); // This will initialize the scheduler and start it in the background

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
