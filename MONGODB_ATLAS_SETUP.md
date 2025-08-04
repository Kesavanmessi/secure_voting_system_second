# MongoDB Atlas Setup Guide

This guide will help you migrate from MongoDB Compass (local) to MongoDB Atlas (cloud) for your secure voting system.

## Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Sign Up**: Create a free account or sign in if you already have one
3. **Choose Plan**: Select the "Free" tier (M0) for development

## Step 2: Create a Cluster

1. **Create New Project**:
   - Click "New Project"
   - Name it "Secure Voting System"
   - Click "Next" and "Create Project"

2. **Build a Database**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to your users
   - Click "Create"

3. **Security Setup**:
   - **Database Access**: Create a database user
     - Username: `securevoting_admin`
     - Password: Create a strong password (save it!)
     - Role: "Atlas admin"
   - **Network Access**: Allow access from anywhere
     - Click "Network Access"
     - Click "Add IP Address"
     - Click "Allow Access from Anywhere" (for development)
     - Click "Confirm"

## Step 3: Get Connection String

1. **Connect to Cluster**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as your driver
   - Copy the connection string

2. **Connection String Format**:
   ```
   mongodb+srv://securevoting_admin:<password>@cluster0.xxxxx.mongodb.net/secureVotingDB?retryWrites=true&w=majority
   ```

## Step 4: Update Your Application

### 1. Create Environment File

Create a `.env` file in your backend directory:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://securevoting_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/secureVotingDB?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### 2. Update Database Configuration

Update your `config/db.js` file:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 3. Update Connection Files

Update these files to use the new connection:

**`index.js`**:
```javascript
const connectDB = require('./config/db');
// ... other imports

// Connect to MongoDB Atlas
connectDB();
```

**`seedAdmin.js`**:
```javascript
const connectDB = require('./config/db');
// ... other imports

const seedAdmins = async () => {
  await connectDB();
  // ... rest of the code
};
```

**`seedVoters.js`**:
```javascript
const connectDB = require('./config/db');
// ... other imports

const seedVotersData = async () => {
  await connectDB();
  // ... rest of the code
};
```

## Step 5: Test the Connection

1. **Start your backend server**:
   ```bash
   cd secure-voting-system/secure-voting-system-backend
   npm start
   ```

2. **Check the console output**:
   - You should see: "MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net"

3. **Test with seed data**:
   ```bash
   node seedAdmin.js
   node seedVoters.js
   ```

## Step 6: Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to git
- Use different environment variables for development and production
- Rotate passwords regularly

### 2. Network Security
- For production, restrict IP access to your server's IP
- Use VPC peering for better security
- Enable MongoDB Atlas security features

### 3. Database Security
- Use strong passwords
- Enable MongoDB Atlas security features
- Regular backups
- Monitor access logs

## Step 7: Production Deployment

### 1. Environment Variables for Production
```bash
# Production Environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://securevoting_admin:PROD_PASSWORD@cluster0.xxxxx.mongodb.net/secureVotingDB?retryWrites=true&w=majority
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-production-email-password
```

### 2. Network Access for Production
- Remove "Allow Access from Anywhere"
- Add only your server's IP address
- Use VPC peering if available

### 3. Database User for Production
- Create a separate database user for production
- Use least privilege principle
- Regular password rotation

## Troubleshooting

### Common Issues:

1. **Connection Timeout**:
   - Check your internet connection
   - Verify the connection string
   - Check if your IP is whitelisted

2. **Authentication Failed**:
   - Verify username and password
   - Check if the user has proper permissions
   - Ensure the database name is correct

3. **Network Access Denied**:
   - Add your IP to the whitelist
   - Check if you're using the correct connection string
   - Verify the cluster is running

### Error Messages:

```
MongoServerError: Authentication failed
```
- Check username/password in connection string

```
MongoServerError: Server selection timed out
```
- Check network connectivity
- Verify IP whitelist

```
MongoParseError: Invalid connection string
```
- Check connection string format
- Verify special characters are properly encoded

## Migration Checklist

- [ ] Create MongoDB Atlas account
- [ ] Create cluster and database
- [ ] Set up database user
- [ ] Configure network access
- [ ] Get connection string
- [ ] Update environment variables
- [ ] Update database configuration
- [ ] Test connection
- [ ] Migrate existing data (if any)
- [ ] Update deployment scripts
- [ ] Test all functionality
- [ ] Update documentation

## Support

- **MongoDB Atlas Documentation**: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- **MongoDB Community**: [https://community.mongodb.com/](https://community.mongodb.com/)
- **MongoDB Support**: Available with paid plans

## Cost Considerations

- **Free Tier**: 512MB storage, shared RAM
- **Paid Plans**: Start from $9/month for dedicated resources
- **Data Transfer**: Free tier includes 500MB/day
- **Backup**: Free tier includes daily backups

For production use, consider upgrading to a paid plan for better performance and support. 