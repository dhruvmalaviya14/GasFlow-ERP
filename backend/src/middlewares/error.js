module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error stack locally for development debugging
  if (err.statusCode === 500) {
    console.error('SERVER ERROR 💥:', err);
  } else {
    console.warn(`CLIENT WARNING (${err.statusCode}): ${err.message}`);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
