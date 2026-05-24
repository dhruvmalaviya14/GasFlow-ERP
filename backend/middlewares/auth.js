const jwt = require('jsonwebtoken');
const { readData } = require('../utils/dbHelper');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforgasdistributionerp2026');

      // Get user from local file database
      const users = readData('users');
      const user = users.find(u => u._id === decoded.id);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (user.status === 'inactive') {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }

      // Exclude password from request object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
