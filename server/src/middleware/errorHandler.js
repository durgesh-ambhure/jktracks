const env = require('../config/env');

// Centralized error-handling middleware (must be registered last).
// Normalizes thrown ApiError instances, Mongoose ValidationError,
// Mongoose CastError, and MongoDB duplicate-key (11000) errors into the
// standard { success:false, message, errors } envelope from CONTRACT.md.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'ValidationError' && err.errors && !err.statusCode) {
    // Mongoose schema validation error
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
    errors = [{ field: err.path, message: `Invalid ${err.kind}` }];
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'`;
    errors = [{ field, message: `${field} already exists` }];
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const payload = { success: false, message, errors };
  if (env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: []
  });
}

module.exports = { errorHandler, notFoundHandler };
