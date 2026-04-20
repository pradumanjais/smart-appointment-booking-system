const errorMiddleware = (err, req, res, next) => {
  console.error('SERVER_ERROR:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorMiddleware;
