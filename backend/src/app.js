const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');
const errorHandler = require('./middlewares/error');
const AppError = require('./utils/AppError');

const app = express();

// 1. Enable Global CORS (Cross-Origin Resource Sharing)
app.use(cors({ origin: '*' }));

// 2. Request body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Home test route
app.get('/', (req, res) => {
  res.status(200).send('Gas Distribution MERN Backend Running Successfully (Production Edition)!');
});

// 4. Mount unified master API routes
app.use('/api', apiRouter);

// 5. Catch undefined endpoints (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 6. Global error handling middleware
app.use(errorHandler);

module.exports = app;
