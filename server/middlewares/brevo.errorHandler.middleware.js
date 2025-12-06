function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Brevo-specific errors
  if (err.message.includes('Brevo') || err.message.includes('email')) {
    return res.status(503).json({
      success: false,
      error: 'Email service temporarily unavailable. Please try again in a few moments.',
      code: 'EMAIL_SERVICE_ERROR',
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

export default errorHandler;
