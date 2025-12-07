# Secure Voting System - Email Notification & Role-Based Approval Setup

This guide explains how to set up the email notification system and role-based approval system for the Secure Voting System.

## Required Environment Variables

Add these variables to your `.env` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
JWT_SECRET=your-jwt-secret-key
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to Security settings
   - Under "2-Step Verification", click on "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "Secure Voting System" as the name
   - Copy the generated 16-character password
   - Use this password as your `EMAIL_PASSWORD` in the `.env` file

## Role-Based Approval System

### Admin Roles and Permissions

The system implements a hierarchical role-based approval system:

#### 1. Head Admin
- **Permissions**: Full system access
- **List Creation**: Can create voter and candidate lists directly
- **Approval Authority**: Can approve/reject requests from other admins
- **Management**: Can manage all aspects of the system

#### 2. Manager Admin
- **Permissions**: Limited system access
- **List Creation**: Must submit requests to Head Admin for approval
- **Approval Authority**: None
- **Management**: Can view reports and manage elections

#### 3. Support Admin
- **Permissions**: Basic system access
- **List Creation**: Must submit requests to Head Admin for approval
- **Approval Authority**: None
- **Management**: Can view reports only

### List Creation Workflow

#### For Head Admin:
1. **Direct Creation**: Head Admin can create voter/candidate lists immediately
2. **Random Password Generation**: For voter lists, passwords are generated automatically
3. **Email Notifications**: Voters receive emails with their credentials

#### For Other Admins:
1. **Request Submission**: Submit list creation requests
2. **Pending Status**: Requests are stored with 'pending' status
3. **Head Admin Review**: Head Admin reviews and approves/rejects
4. **Notification**: Admin receives status update
5. **Automatic Creation**: If approved, lists are created automatically

### API Endpoints

#### List Creation (Role-Based)
- `POST /api/auth/voters/create` - Create voter list (Head Admin) or submit request (Others)
- `POST /api/auth/candidates/create` - Create candidate list (Head Admin) or submit request (Others)

#### Head Admin Management
- `GET /api/auth/pending-voter-lists` - View pending voter list requests
- `GET /api/auth/pending-candidate-lists` - View pending candidate list requests
- `POST /api/auth/approve-voter-list/:requestId` - Approve voter list request
- `POST /api/auth/reject-voter-list/:requestId` - Reject voter list request
- `POST /api/auth/approve-candidate-list/:requestId` - Approve candidate list request
- `POST /api/auth/reject-candidate-list/:requestId` - Reject candidate list request

#### Request Status
- `GET /api/auth/request-status/:requestId` - Check request status (for requesting admin)

### Request Status Tracking

Each request includes:
- **Request ID**: Unique identifier for tracking
- **Requested By**: Admin who submitted the request
- **List Details**: Complete list information
- **Status**: pending/approved/rejected
- **Review Information**: Who reviewed, when, and notes
- **Timestamps**: Creation and update times

## Email Notifications

The system now sends the following email notifications:

### 1. Election Creation Email
- **When**: Sent when a voter is added to an election
- **Content**: 
  - Election name and details
  - Voter ID and email
  - **Randomly generated password** (new feature)
  - Security notice about dual authentication

### 2. Election Start Email
- **When**: Sent when an election starts
- **Content**: Election start and end times

### 3. Election End Email
- **When**: Sent when an election ends
- **Content**: Notification that voting has ended

### 4. OTP Email
- **When**: Sent during voter login process
- **Content**: 6-digit OTP for verification

## New Features

### Random Password Generation
- **Automatic Generation**: When creating voter lists, random 12-character passwords are automatically generated for each voter
- **No Manual Passwords**: Voters no longer need manual passwords in the voter list
- **Email Delivery**: Random passwords are sent to voters via email when elections are created
- **Dual Authentication**: Voters must use both the random password AND OTP to log in

### Role-Based Approval System
- **Hierarchical Access**: Different admin roles have different permissions
- **Request Tracking**: All requests are tracked with unique IDs
- **Approval Workflow**: Non-Head Admins must get approval for list creation
- **Audit Trail**: Complete history of who requested, reviewed, and when

### Voter Authentication Flow
1. Voter enters election name and voter ID
2. System validates credentials and sends OTP to voter's email
3. Voter enters OTP for verification
4. Upon successful verification, voter gains access to voting dashboard

## Testing the System

Run the test scripts to verify functionality:

```bash
# Test email system
node testEmail.js

# Test password generation
node testPasswordGeneration.js

# Test approval system
node testApprovalSystem.js
```

## Database Models

### New Models Added:
- **PendingVoterList**: Stores pending voter list requests
- **PendingCandidateList**: Stores pending candidate list requests

### Updated Models:
- **Voters**: Made password field optional (generated automatically)
- **Admin**: Role-based permissions system

## Important Notes

- **Update Voter Data**: Make sure to update the voter seed data with real email addresses
- **Gmail App Password**: Use app passwords, not your regular Gmail password
- **Environment Variables**: Ensure all required environment variables are set before running the application
- **Password Security**: Random passwords are generated with uppercase, lowercase, numbers, and special characters
- **Role Management**: Only Head Admin can approve/reject requests
- **Request Tracking**: All requests are logged with complete audit trail

## Troubleshooting

- **Email Not Sending**: Check your Gmail app password and 2FA settings
- **Connection Issues**: Verify your internet connection and Gmail settings
- **Environment Variables**: Ensure `.env` file is in the correct location and variables are properly set
- **Permission Errors**: Verify admin roles and permissions
- **Request Not Found**: Check request ID format and database connectivity 