// File: controllers/contact-controller.js
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/nodeMailer.js'; // ✅ Your existing utility

export const sendContactEmail = wrapper(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    subject,
    message,
    userType,
    submittedAt,
    prefilledFromProfile,
    authenticatedUser,
  } = req.body;

  // ✅ Input validation
  if (!firstName || !lastName || !email || !message) {
    throw new ApiError(400, 'Please fill in all required fields');
  }

  // ✅ Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  // ✅ Message length validation
  if (message.length > 1000) {
    throw new ApiError(400, 'Message must be less than 1000 characters');
  }

  try {
    // ✅ Subject mapping for better organization
    const subjectMap = {
      general: 'General Inquiry',
      booking: 'Booking Support',
      technical: 'Technical Issue',
      'counselor-application': 'Counselor Application',
      billing: 'Billing Question',
      feedback: 'Feedback',
    };

    const emailSubject = `[Solvit Contact] ${subjectMap[subject] || 'General Inquiry'} - ${firstName} ${lastName}`;

    // ✅ UPDATED: Using your existing sendEmail utility format
    const emailContent = `
NEW CONTACT FORM SUBMISSION - Solvit Platform

==========================================
CONTACT DETAILS
==========================================
Name: ${firstName} ${lastName}
Email: ${email}
User Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
Subject: ${subjectMap[subject] || subject}
Submitted: ${new Date(submittedAt).toLocaleString()}

${authenticatedUser ? '✅ Authenticated User' : '📝 Guest User'}
${prefilledFromProfile ? '🔒 Profile Auto-filled' : '✏️ Manually Entered'}

==========================================
MESSAGE
==========================================
${message}

==========================================
RESPONSE INSTRUCTIONS
==========================================
• Reply directly to this email to respond to ${firstName}
• Customer email: ${email}
• Priority: ${subject === 'technical' || subject === 'booking' ? 'HIGH' : 'NORMAL'}

This message was sent from the Solvit contact form.
Solvit Mental Health Platform • ${new Date().getFullYear()}
    `;

    // ✅ Send email to support team using your existing utility
    const supportEmailResult = await sendEmail(
      process.env.SUPPORT_EMAIL || 'support@solvitcounselling.com', // Your support email
      emailSubject,
      emailContent
    );

    // ✅ Send confirmation email to user
    const confirmationSubject = `✅ We received your message - Solvit Support`;
    const confirmationContent = `Hi ${firstName},

Thank you for contacting Solvit! We've received your message about "${subjectMap[subject] || subject}" and will get back to you within 24 hours.

Your Message Summary:
----------------------
Subject: ${subjectMap[subject] || subject}
Submitted: ${new Date(submittedAt).toLocaleString()}

Message:
${message}

What's Next?
------------
• Our support team will review your message
• You'll receive a response within 24 hours
• For urgent matters, call us at +91 9527542303

Need immediate help? Visit our FAQ section or call during business hours (Mon-Fri, 9AM-6PM IST).

Best regards,
The Solvit Support Team

---
Solvit Mental Health Platform
🌐 Website: https://solvitcounselling.com
📧 Email: support@solvitcounselling.com
📞 Phone: +91 9527542303

This is an automated confirmation email. Please don't reply directly to this message.
    `;

    const confirmationResult = await sendEmail(email, confirmationSubject, confirmationContent);

    // ✅ Success response
    res.status(200).json(
      new ApiResponse(
        200,
        {
          submitted: true,
          timestamp: submittedAt,
          supportEmailSent: !!supportEmailResult,
          confirmationEmailSent: !!confirmationResult,
        },
        'Contact form submitted successfully'
      )
    );
  } catch (error) {
    console.error('Email sending error:', error);
    throw new ApiError(
      500,
      'Failed to send email. Please try again or contact us directly at support@solvitcounselling.com'
    );
  }
});
