import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config({ path: './.env' });

// Create a transporter using Gmail and environment credentials with proper timeout configurations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  // Connection timeout settings
  connectionTimeout: 10000, // 10 seconds to establish connection
  greetingTimeout: 5000, // 5 seconds to receive greeting
  socketTimeout: 10000, // 10 seconds socket timeout

  // Secure connection settings
  secure: true,

  // Pool settings for better performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14, // Send at most 14 emails per second

  // Debug logging (only in development)
  debug: process.env.NODE_ENV !== 'production',
  logger: process.env.NODE_ENV !== 'production',
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text, attachments) => {
  try {
    // Base mail options
    const mailOptions = {
      from: `"Solvit" <${process.env.EMAIL}>`,
      to,
      subject,
      html: text,
    };

    // Add attachments only if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.log('ERROR Sending Email:', error);

    // Provide more specific error messages
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTIONTIMEOUT') {
      throw new Error('Email service connection timeout. Please try again later.');
    } else if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check credentials.');
    } else if (error.code === 'EENVELOPE') {
      throw new Error('Invalid email address format.');
    }

    throw error;
  }
};

export { sendEmail };
