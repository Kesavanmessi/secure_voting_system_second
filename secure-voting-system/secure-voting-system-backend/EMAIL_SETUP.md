# Email Notification System Setup

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secureVotingDB

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Encryption Key
ENCRYPTION_KEY=3f9d2c7b59f7468a1e5b34c1a9f872db12fe6a89cc4e7b6a9d4528fc1234abcd

# Server Configuration
PORT=5000
```

## Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as your `EMAIL_PASSWORD` in the .env file

### Step 3: Update Voter Data
Make sure to update the voter seed data with real email addresses for testing.

## Email Notifications

The system now sends the following email notifications:

1. **Election Creation Email**: Sent when a voter is added to an election
2. **Election Start Email**: Sent when an election starts
3. **Election End Email**: Sent when an election ends
4. **OTP Email**: Sent for voter authentication

## OTP Authentication Flow

1. Voter enters election name, voter ID, and password
2. System validates credentials and sends OTP to voter's email
3. Voter enters OTP for final authentication
4. System verifies OTP and grants access

## Testing

To test the email system:
1. Set up your Gmail credentials in .env
2. Run the seed scripts to populate voters with email addresses
3. Create an election and add voters
4. The system will automatically send emails when elections start/end 