function errorHandler(err, req, res, next) {
  // Brevo-specific errors
  if (err?.message && (err.message.includes('Brevo') || err.message.includes('email'))) {
    console.error('Brevo Error:', err);
    return res.status(503).json({
      success: false,
      error: 'Email service temporarily unavailable. Please try again in a few moments.',
      code: 'EMAIL_SERVICE_ERROR',
    });
  }

  // Pass non-Brevo errors to next error handling middleware
  return next(err);
}

export default errorHandler;
