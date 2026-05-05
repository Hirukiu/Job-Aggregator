// Central error handler for the backend.
// Express needs 4 parameters to detect this as an error middleware.

function errorHandler(err, req, res, next) {
  void next;

  // Invalid or expired JWT token: 401 Unauthorized.
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }

  // Known error with a custom HTTP status code.
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Unknown error: we log it and return a generic 500 response.
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}

module.exports = errorHandler;
