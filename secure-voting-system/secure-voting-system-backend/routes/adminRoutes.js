const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const PendingAdmin = require("../models/PendingAdmin");
const { sendAdminApprovalEmail, sendAdminRemovalEmail } = require("../utils/emailService");

// Middleware to check if the admin already exists
const checkHeadAdmin = async (req, res, next) => {
  if (req.body.role === "Head Admin") {
    const headAdminExists = await Admin.findOne({ role: "Head Admin" });
    if (headAdminExists) {
      return res.status(400).json({
        success: false,
        message: "A Head Admin already exists. You cannot add another one.",
      });
    }
  }
  next();
};

// 1. GET all admins
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 2. POST add a new admin (Direct creation by Head Admin)
router.post("/", checkHeadAdmin, async (req, res) => {
  const { username, role, password, adminId } = req.body;

  if (!username || !role || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, role, and password are required.",
    });
  }

  try {
    if (await Admin.findOne({ username }) || await Admin.findOne({ adminId }))
      return res.status(201).json({ success: false, admin: "" });
    const newAdmin = new Admin({ username, role, password, adminId }); // Hash password in production
    await newAdmin.save();
    res.status(201).json({ success: true, admin: newAdmin });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 3. PUT update an admin
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({
      success: false,
      message: "Username and role are required for updating.",
    });
  }

  if (role === "Head Admin") {
    return res.status(400).json({
      success: false,
      message: "You cannot change an admin's role to 'Head Admin'.",
    });
  }

  try {
    const updatedAdmin = await Admin.updateOne(
      { adminId: id },
      { username, role },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    res.status(200).json({ success: true, admin: updatedAdmin });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 4. DELETE remove an admin
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findOne({ adminId: id });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // Attempt to send email notification
    if (admin.adminId && admin.adminId.includes('@')) {
      await sendAdminRemovalEmail(admin.adminId, admin.username);
    }

    await Admin.deleteOne({ adminId: id });

    res.status(200).json({ success: true, message: "Admin deleted and notified successfully." });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// --- New Routes for Manager Admin Signup & Approval ---

// 5. POST /signup - Create a pending admin request
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check if username or email already exists in Admin or PendingAdmin
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { adminId: email }] }); // Assuming email is used as adminId or similar check
    const existingPending = await PendingAdmin.findOne({ $or: [{ username }, { email }] });

    if (existingAdmin || existingPending) {
      return res.status(400).json({ success: false, message: "Username or Email already exists." });
    }

    const newPendingAdmin = new PendingAdmin({
      username,
      email,
      password
    });

    await newPendingAdmin.save();
    res.status(201).json({ success: true, message: "Signup successful! Please wait for Head Admin approval." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 6. GET /pending - Get all pending admin requests
router.get("/pending/requests", async (req, res) => {
  try {
    const requests = await PendingAdmin.find({});
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 7. POST /approve-signup/:id - Approve a pending request
router.post("/approve-signup/:id", async (req, res) => {
  try {
    const pendingAdmin = await PendingAdmin.findById(req.params.id);
    if (!pendingAdmin) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Create new Admin
    // Using email as adminId.
    // Use insertOne to prevent double hashing if password is already hashed in PendingAdmin, 
    // BUT PendingAdmin schema likely has pre-save hash. Admin schema definitely has pre-save hash.
    // If we pass hashed password to new Admin(), Admin's pre-save will re-hash it.
    // So we use collection.insertOne to bypass middlewares for data migration.

    await Admin.collection.insertOne({
      adminId: pendingAdmin.email,
      username: pendingAdmin.username,
      password: pendingAdmin.password, // Already hashed
      role: 'Manager Admin',
      permissions: ['manageElections', 'viewReports'],
      __v: 0
    });

    // Delete from Pending
    await PendingAdmin.findByIdAndDelete(req.params.id);

    // Send Email
    sendAdminApprovalEmail(pendingAdmin.email, pendingAdmin.username);

    res.status(200).json({ success: true, message: "Admin approved successfully." });
  } catch (error) {
    console.error("Error approving admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 8. DELETE /reject-signup/:id - Reject a pending request
router.delete("/reject-signup/:id", async (req, res) => {
  try {
    await PendingAdmin.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Request rejected." });
  } catch (error) {
    console.error("Error rejecting admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
