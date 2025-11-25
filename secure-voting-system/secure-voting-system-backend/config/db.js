const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  // read env var in outer scope so catch block can access it
  const mongoURI = process.env.MONGODB_URI;
  try {
    if (!mongoURI) {
      throw new Error('MONGODB_URI not set in .env');
    }
    // Mongoose v6+ (and Node driver v4+) don't need useNewUrlParser/useUnifiedTopology options
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Handle common DNS SRV lookup failures for mongodb+srv URIs and provide a helpful fallback
    console.error('Error connecting to MongoDB:', error.message || error);

    // If this was a DNS SRV failure (ENOTFOUND on _mongodb._tcp.<host>) and we have a fallback
    if (error.code === 'ENOTFOUND' && mongoURI && mongoURI.startsWith('mongodb+srv')) {
      const fallback = process.env.MONGODB_URI_FALLBACK;
      if (fallback) {
        console.warn('SRV lookup failed for mongodb+srv URI — attempting fallback connection using MONGODB_URI_FALLBACK');
        try {
          const conn = await mongoose.connect(fallback);
          console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
          return conn;
        } catch (fallbackErr) {
          console.error('Fallback connection failed:', fallbackErr.message || fallbackErr);
          process.exit(1);
        }
      }

      console.error('\nDNS SRV lookup for your Atlas cluster failed. Possible causes:');
      console.error('- Incorrect cluster name in MONGODB_URI');
      console.error('- Local DNS/network issues blocking SRV lookup (try from a different network)');
      console.error('- Atlas cluster is paused or deleted');
      console.error('\nIf you cannot use SRV, set MONGODB_URI_FALLBACK in .env to a non-SRV connection string (mongodb://host1:port,host2:port/?replicaSet=...)');
      process.exit(1);
    }

    // For other errors, exit with a clear message so the operator can fix the config
    process.exit(1);
  }
};

module.exports = connectDB;
