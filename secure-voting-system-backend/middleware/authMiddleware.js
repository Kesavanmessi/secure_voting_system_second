const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify if the admin has the required role
const verifyAdminRole = (...allowedRoles) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized access' });

    try {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !allowedRoles.includes(admin.role)) {
        return res.status(403).json({ message: 'Access forbidden: Insufficient privileges' });
      }

      req.admin = admin;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error verifying admin', error });
    }
  });
};

module.exports = { verifyAdminRole };
