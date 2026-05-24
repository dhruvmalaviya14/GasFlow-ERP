const jwt = require('jsonwebtoken');
const { readData } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforgasdistributionerp2026');

    // 2. Fetch user from local JSON database
    const users = readData('users');
    const user = users.find(u => u._id === decoded.id);
    
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (user.status === 'inactive') {
      return next(new AppError('Your account is currently inactive.', 401));
    }

    // 3. Exclude password and grant access
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Not authorized as an admin', 403));
  }
};

module.exports = { protect, admin };
