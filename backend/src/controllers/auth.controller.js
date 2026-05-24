const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);

  res.status(200).json({
    success: true,
    ...result
  });
});

const getProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = {
  login,
  getProfile
};
