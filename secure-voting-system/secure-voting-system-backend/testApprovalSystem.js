// Test script for role-based approval system
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const PendingVoterList = require('./models/PendingVoterList');
const PendingCandidateList = require('./models/PendingCandidateList');

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/secureVotingDB';

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected for Approval System Test'))
  .catch(err => console.error('MongoDB connection error:', err));

const testApprovalSystem = async () => {
  console.log('Testing role-based approval system...\n');

  try {
    // Test data for pending requests
    const testVoterRequest = {
      requestId: 'VOTER_1234567890_123',
      requestedBy: {
        adminId: 'admin002',
        username: 'manager_admin',
        role: 'Manager Admin'
      },
      listname: 'Test Voter List 2024',
      voters: [
        {
          voterId: 'test_voter_001',
          voterName: 'Test Voter One',
          email: 'test1@example.com',
          address: '123 Test St',
          age: 25
        },
        {
          voterId: 'test_voter_002',
          voterName: 'Test Voter Two',
          email: 'test2@example.com',
          address: '456 Test Ave',
          age: 30
        }
      ],
      status: 'pending'
    };

    const testCandidateRequest = {
      requestId: 'CANDIDATE_1234567890_456',
      requestedBy: {
        adminId: 'admin003',
        username: 'support_admin',
        role: 'Support Admin'
      },
      listname: 'Test Candidate List 2024',
      candidates: [
        {
          candidateId: 'candidate_001',
          candidateName: 'Test Candidate One',
          party: 'Test Party A',
          symbol: 'Star'
        },
        {
          candidateId: 'candidate_002',
          candidateName: 'Test Candidate Two',
          party: 'Test Party B',
          symbol: 'Circle'
        }
      ],
      status: 'pending'
    };

    // Create test pending requests
    console.log('1. Creating test pending voter list request...');
    const voterRequest = new PendingVoterList(testVoterRequest);
    await voterRequest.save();
    console.log('   ✓ Voter list request created successfully');

    console.log('2. Creating test pending candidate list request...');
    const candidateRequest = new PendingCandidateList(testCandidateRequest);
    await candidateRequest.save();
    console.log('   ✓ Candidate list request created successfully');

    // Simulate Head Admin approval process
    console.log('\n3. Simulating Head Admin approval process...');
    
    // Update voter request as approved
    await PendingVoterList.findOneAndUpdate(
      { requestId: testVoterRequest.requestId },
      {
        status: 'approved',
        reviewedBy: {
          adminId: 'admin001',
          username: 'head_admin',
          role: 'Head Admin'
        },
        reviewDate: new Date(),
        reviewNotes: 'Approved for testing purposes'
      }
    );
    console.log('   ✓ Voter list request approved');

    // Update candidate request as rejected
    await PendingCandidateList.findOneAndUpdate(
      { requestId: testCandidateRequest.requestId },
      {
        status: 'rejected',
        reviewedBy: {
          adminId: 'admin001',
          username: 'head_admin',
          role: 'Head Admin'
        },
        reviewDate: new Date(),
        reviewNotes: 'Rejected for testing purposes'
      }
    );
    console.log('   ✓ Candidate list request rejected');

    // Fetch and display results
    console.log('\n4. Fetching all pending requests...');
    
    const pendingVoterRequests = await PendingVoterList.find({ status: 'pending' });
    const pendingCandidateRequests = await PendingCandidateList.find({ status: 'pending' });
    
    console.log(`   Pending voter requests: ${pendingVoterRequests.length}`);
    console.log(`   Pending candidate requests: ${pendingCandidateRequests.length}`);

    // Fetch approved and rejected requests
    const approvedVoterRequests = await PendingVoterList.find({ status: 'approved' });
    const rejectedCandidateRequests = await PendingCandidateList.find({ status: 'rejected' });
    
    console.log(`   Approved voter requests: ${approvedVoterRequests.length}`);
    console.log(`   Rejected candidate requests: ${rejectedCandidateRequests.length}`);

    console.log('\n5. Displaying request details...');
    
    if (approvedVoterRequests.length > 0) {
      const request = approvedVoterRequests[0];
      console.log(`   Approved Voter Request:`);
      console.log(`     Request ID: ${request.requestId}`);
      console.log(`     List Name: ${request.listname}`);
      console.log(`     Requested By: ${request.requestedBy.username} (${request.requestedBy.role})`);
      console.log(`     Reviewed By: ${request.reviewedBy.username} (${request.reviewedBy.role})`);
      console.log(`     Review Notes: ${request.reviewNotes}`);
      console.log(`     Voters Count: ${request.voters.length}`);
    }

    if (rejectedCandidateRequests.length > 0) {
      const request = rejectedCandidateRequests[0];
      console.log(`   Rejected Candidate Request:`);
      console.log(`     Request ID: ${request.requestId}`);
      console.log(`     List Name: ${request.listname}`);
      console.log(`     Requested By: ${request.requestedBy.username} (${request.requestedBy.role})`);
      console.log(`     Reviewed By: ${request.reviewedBy.username} (${request.reviewedBy.role})`);
      console.log(`     Review Notes: ${request.reviewNotes}`);
      console.log(`     Candidates Count: ${request.candidates.length}`);
    }

    console.log('\n✓ Role-based approval system test completed successfully!');

  } catch (error) {
    console.error('Error testing approval system:', error);
  } finally {
    mongoose.connection.close();
  }
};

testApprovalSystem(); 