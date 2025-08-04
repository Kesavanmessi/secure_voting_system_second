const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

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

// 2. POST add a new admin
router.post("/", checkHeadAdmin, async (req, res) => {
  const { username, role, password ,adminId } = req.body;

  if (!username || !role || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, role, and password are required.",
    });
  }

  try {
    if(await Admin.findOne({username}) || await Admin.findOne({adminId}))
        return res.status(201).json({success:false , admin:""});
    const newAdmin = new Admin({ username, role, password ,adminId }); // Hash password in production
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
      {adminId:id},
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
    const deletedAdmin = await Admin.deleteOne({adminId:id});

    if (!deletedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    res.status(200).json({ success: true, message: "Admin deleted successfully." });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
