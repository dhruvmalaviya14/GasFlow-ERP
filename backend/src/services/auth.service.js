const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforgasdistributionerp2026', {
    expiresIn: '30d'
  });
};

const login = async (username, password) => {
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }

  // 1. Read users from local database
  const users = readData('users');
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // 2. Compare passwords
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status === 'inactive') {
    throw new AppError('Your account is currently inactive', 401);
  }

  // 3. Log Activity to audit file
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: user.username,
    action: 'Logged into the system',
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  // 4. Return token & user info
  return {
    token: generateToken(user._id),
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  };
};

module.exports = {
  login
};
