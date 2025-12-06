import * as Brevo from '@getbrevo/brevo';

let apiInstance = null;
let isConfigured = false;

/**
 * Initialize Brevo on server start
 */
function initializeBrevo() {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY missing in .env');
    }
    apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

    isConfigured = true;
    console.log('✅ Brevo initialized successfully');
  } catch (err) {
    console.error('❌ Brevo init failed:', err.message);
    isConfigured = false;
  }
}

/**
 * Verify Brevo account connection  ( nit using for now )
 */
async function verifyBrevoConnection() {
  if (!isConfigured) throw new Error('Brevo not initialized');

  try {
    const accountApi = new Brevo.AccountApi();
    const account = await accountApi.getAccount();

    console.log('✅ Brevo connection verified');
    console.log(`   Email: ${account.email}`);
    console.log(`   Plan: ${account.plan[0]?.type}`);
    console.log(`   Daily Limit: ${account.plan[0]?.credits}`);

    return true;
  } catch (err) {
    console.error('❌ Brevo verification failed:', err.message);
    throw err;
  }
}

/**
 * Send email with retry mechanism ( not using)
 */
async function sendEmailWithRetry(emailOptions, retries = 3) {
  if (!isConfigured) throw new Error('Brevo not initialized');

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📨 Sending email to ${emailOptions.to[0].email} (Attempt ${attempt})`);

      const response = await apiInstance.sendTransacEmail(emailOptions);

      console.log(`✅ Email sent: ${emailOptions.to[0].email}`);
      console.log(`   Message ID: ${response.messageId}`);

      return { success: true, messageId: response.messageId };
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed →`, err.response?.body || err.message);

      if (attempt === retries) throw new Error('Failed after all retries.');

      console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
      await delay(attempt * 1000);
    }
  }
}
/**
 * Send OTP email for registration for counselor
 */
async function sendCounselorRegistrationOTP(email, otp, userName, expiryMinutes) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Verify Your Solvit Counselor Registration',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Solvit Counselor Registration OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header with Logo & Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <!-- Logo -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.cloud/logo.png'}" alt="Solvit Counseling" style="width: 160px; height: auto; display: block; margin-bottom: 20px; border-radius: 50%" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Counselor Registration
                    </h1>
                    <p style="color: #e9d5ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">
                      Join India's Trusted Counseling Platform
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <!-- Greeting -->
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Welcome, ${userName || 'Counselor'}! 
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.65; margin: 0 0 20px 0;">
                      Thank you for choosing <strong style="color: #7C3AED;">Solvit</strong> as your counseling platform. We're excited to have you join our community of expert counselors helping individuals across India navigate their personal and professional challenges.
                    </p>

                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                      To complete your registration, please verify your email address with the code below:
                    </p>

                    <!-- OTP Card with Solvit Theme -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 36px 24px; text-align: center; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);">
                          <p style="color: #e9d5ff; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin: 0 0 12px 0; text-transform: uppercase;">
                            Your Verification Code
                          </p>
                          <p style="color: #ffffff; font-size: 44px; font-weight: 700; letter-spacing: 10px; margin: 0; font-family: 'Courier New', Courier, monospace; line-height: 1;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 12px; font-size: 20px; width: 30px;">⏱️</td>
                              <td style="vertical-align: middle;">
                                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                                  <strong>Time-sensitive:</strong> This code expires in <strong>${expiryMinutes} minutes</strong>. Complete your registration promptly.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #f3f4f6; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 16px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 12px; font-size: 20px; width: 30px;">🔒</td>
                              <td style="vertical-align: middle;">
                                <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
                                  <strong>Security reminder:</strong> Never share this code. Solvit staff will never ask for your verification code.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help Text -->
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong style="color: #374151;">Didn't request this?</strong><br>
                      If you didn't register as a counselor, please ignore this email. For security concerns, contact 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.cloud</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0; font-weight: 500;">
                            Connect with us
                          </p>
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="https://www.linkedin.com/company/solvitcounselling/" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="https://x.com/solvitforyou?s=21" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="https://www.instagram.com/solvitcounselling" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="https://www.facebook.com/share/12HYipkeXG9/" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal Footer -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 6px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 8px 0 0 0;">
                            This is an automated message, please do not reply.<br>
                            Need help? <a href="mailto:support@solvitcounselling.cloud" style="color: #7C3AED; text-decoration: none;">Contact Support</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `SOLVIT COUNSELING - COUNSELOR REGISTRATION
    
Welcome, ${userName || 'Counselor'}!

Thank you for choosing Solvit as your counseling platform. We're excited to have you join our community of expert counselors.

YOUR VERIFICATION CODE: ${otp}

This code expires in ${expiryMinutes} minutes. Please complete your registration promptly.

SECURITY REMINDER:
Never share this code with anyone. Solvit staff will never ask for your verification code.

Didn't request this code?
If you didn't attempt to register as a counselor on Solvit, please disregard this email. Contact support@solvitcounselling.cloud if you have concerns.

---
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
This is an automated message, please do not reply.`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send counselor registration OTP:', error.message);
    throw new Error('Unable to send verification code. Please try again later.');
  }
}

async function sendClientRegistrationOTP(email, otp, userName, expiryMinutes) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Welcome to Solvit - Verify Your Account',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Solvit Client Registration OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                      Welcome to Solvit! 
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Hello, ${userName || 'there'}! 
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                      Thank you for joining <strong style="color: #7C3AED;">Solvit</strong>. Verify your email to get started.
                    </p>

                    <!-- OTP Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 36px 24px; text-align: center; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);">
                          <p style="color: #e9d5ff; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin: 0 0 12px 0; text-transform: uppercase;">
                            Your Verification Code
                          </p>
                          <p style="color: #ffffff; font-size: 44px; font-weight: 700; letter-spacing: 10px; margin: 0; font-family: 'Courier New', Courier, monospace;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #f3f4f6; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #374151; margin: 0; font-size: 14px;">
                            🔒 Keep this code private. Never share it with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      Didn't sign up? Ignore this email or contact 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `WELCOME TO SOLVIT!

Hello, ${userName || 'there'}!

YOUR VERIFICATION CODE: ${otp}

This code expires in ${expiryMinutes} minutes.

Keep this code private. Never share it with anyone.

Didn't sign up? Contact support@solvitcounselling.com

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send client registration OTP:', error.message);
    throw new Error('Unable to send verification code. Please try again later.');
  }
}

async function sendCounselorForgotPasswordOTP(email, otp, userName, expiryMinutes = 10) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Reset Your Solvit Counselor Password',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Solvit Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                      Password Reset Request
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Hello, ${userName || 'there'}!
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                      We received a request to reset your <strong style="color: #7C3AED;">Solvit</strong> counselor account password. Use the code below to proceed.
                    </p>

                    <!-- OTP Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 36px 24px; text-align: center; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);">
                          <p style="color: #e9d5ff; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin: 0 0 12px 0; text-transform: uppercase;">
                            Your Password Reset Code
                          </p>
                          <p style="color: #ffffff; font-size: 44px; font-weight: 700; letter-spacing: 10px; margin: 0; font-family: 'Courier New', Courier, monospace;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #991b1b; margin: 0; font-size: 14px;">
                            ⚠️ <strong>Didn't request this?</strong> Your account is safe. Ignore this email or contact support immediately.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      Need help? Contact us at 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `SOLVIT PASSWORD RESET

Hello, ${userName || 'there'}!

We received a request to reset your Solvit counselor account password.

YOUR PASSWORD RESET CODE: ${otp}

This code expires in ${expiryMinutes} minutes.

Didn't request this? Your account is safe. Ignore this email or contact support@solvitcounselling.com

Need help? support@solvitcounselling.com

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send forgot password OTP:', error.message);
    throw new Error('Unable to send password reset code. Please try again later.');
  }
}

async function sendClientForgotPasswordOTP(email, otp, userName, expiryMinutes = 10) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Reset Your Solvit Password',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Solvit Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                      Password Reset Request
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Hello, ${userName || 'there'}!
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                      We received a request to reset your <strong style="color: #7C3AED;">Solvit</strong> account password. Use the code below to proceed.
                    </p>

                    <!-- OTP Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 36px 24px; text-align: center; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);">
                          <p style="color: #e9d5ff; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin: 0 0 12px 0; text-transform: uppercase;">
                            Your Password Reset Code
                          </p>
                          <p style="color: #ffffff; font-size: 44px; font-weight: 700; letter-spacing: 10px; margin: 0; font-family: 'Courier New', Courier, monospace;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #991b1b; margin: 0; font-size: 14px;">
                            ⚠️ <strong>Didn't request this?</strong> Your account is safe. Ignore this email or contact support immediately.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      Need help? Contact us at 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `SOLVIT PASSWORD RESET

Hello, ${userName || 'there'}!

We received a request to reset your Solvit account password.

YOUR PASSWORD RESET CODE: ${otp}

This code expires in ${expiryMinutes} minutes.

Didn't request this? Your account is safe. Ignore this email or contact support@solvitcounselling.com

Need help? support@solvitcounselling.com

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send forgot password OTP:', error.message);
    throw new Error('Unable to send password reset code. Please try again later.');
  }
}

async function sendCounselorApplicationSubmitted(email, userName) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Application Received - Solvit Counselor',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Application Submitted</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                      Application Received! ✓
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Dear ${userName || 'Counselor'},
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Your counselor application has been successfully submitted to <strong style="color: #7C3AED;">Solvit</strong>. We're reviewing your credentials and professional profile.
                    </p>

                    <!-- Timeline Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 8px; padding: 24px;">
                          <p style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 16px 0;">
                            📋 What Happens Next?
                          </p>
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color: #7C3AED; font-weight: 700; padding: 0 12px 10px 0; vertical-align: top; font-size: 14px; width: 30px;">1.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">Our team reviews your credentials and documents</td>
                            </tr>
                            <tr>
                              <td style="color: #7C3AED; font-weight: 700; padding: 0 12px 10px 0; vertical-align: top; font-size: 14px;">2.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">We verify your professional licenses and qualifications</td>
                            </tr>
                            <tr>
                              <td style="color: #7C3AED; font-weight: 700; padding: 0 12px 0 0; vertical-align: top; font-size: 14px;">3.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6;">You'll receive approval notification within <strong>24-48 hours</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Approval Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
                            ✨ <strong>Once approved,</strong> you will be notified via email and can immediately start taking counseling sessions with clients on the Solvit platform.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Status Check Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
                          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                            💡 <strong>Track your application:</strong> Check your status anytime in your counselor dashboard.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                      Questions about your application? Contact us at 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `APPLICATION RECEIVED

Dear ${userName || 'Counselor'},

Your counselor application has been successfully submitted to Solvit. We're reviewing your credentials and professional profile.

WHAT HAPPENS NEXT?
1. Our team reviews your credentials and documents
2. We verify your professional licenses and qualifications
3. You'll receive approval notification within 24-48 hours

Once approved, you will be notified via email and can immediately start taking counseling sessions with clients on the Solvit platform.

Track your application: Check your status anytime in your counselor dashboard under "Application Status".

Questions? Contact support@solvitcounselling.com

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send application confirmation:', error.message);
    throw new Error('Unable to send application confirmation. Please try again later.');
  }
}

async function sendCounselorApplicationApproved(email, userName) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Congratulations! Counselor Application Approved',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Application Approved</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                      🎉 Congratulations!
                    </h1>
                    <p style="color: #dcfce7; margin: 12px 0 0 0; font-size: 15px; font-weight: 500;">
                      Your Application Has Been Approved
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Dear ${userName || 'Counselor'},
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      We're excited to inform you that your counselor application with <strong style="color: #16a34a;">Solvit</strong> has been approved! You are now part of our trusted network of certified professionals guiding individuals across various counselling domains.
                    </p>

                    <!-- Success Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 8px; padding: 20px;">
                          <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
                            ✓ <strong>You can now:</strong> Access your counselor dashboard, set your availability, and start accepting client sessions immediately.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Next Steps -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 8px; padding: 24px;">
                          <p style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 16px 0;">
                            🚀 Get Started in 3 Steps
                          </p>
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color: #16a34a; font-weight: 700; padding: 0 12px 10px 0; vertical-align: top; font-size: 14px; width: 30px;">1.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">Complete your profile with bio, specializations, and photo</td>
                            </tr>
                            <tr>
                              <td style="color: #16a34a; font-weight: 700; padding: 0 12px 10px 0; vertical-align: top; font-size: 14px;">2.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">Set your availability and session preferences</td>
                            </tr>
                            <tr>
                              <td style="color: #16a34a; font-weight: 700; padding: 0 12px 0 0; vertical-align: top; font-size: 14px;">3.</td>
                              <td style="color: #374151; font-size: 14px; line-height: 1.6;">Start accepting and managing client sessions</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                      Need help getting started? Contact us at 
                      <a href="mailto:support@solvitcounselling.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `CONGRATULATIONS!

Dear ${userName || 'Counselor'},

Your counselor application with Solvit has been approved! You are now part of our trusted network of mental health professionals.

You can now: Access your counselor dashboard, set your availability, and start accepting client sessions immediately.

GET STARTED IN 3 STEPS:
1. Complete your profile with bio, specializations, and photo
2. Set your availability 
3. Start accepting and managing client sessions

Need help? Contact support@solvitcounselling.com

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send approval email:', error.message);
    throw new Error('Unable to send approval notification. Please try again later.');
  }
}

async function sendCounselorApplicationRejected(email, userName, rejectionReason = null) {
  const emailOptions = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'system@solvitcounselling.com',
      name: process.env.BREVO_SENDER_NAME || 'Solvit Counseling',
    },
    to: [{ email, name: userName || email }],
    subject: 'Counselor Application Update - Solvit',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Application Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 48px 40px 40px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <img src="${process.env.LOGO_URL || 'https://solvitcounselling.com/logo.png'}" alt="Solvit" style="width: 140px; height: 140px; display: block; margin: 0 auto 20px auto; border-radius: 50%; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                      Application Update
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 700;">
                      Dear ${userName || 'Counselor'},
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for your interest in joining <strong style="color: #7C3AED;">Solvit</strong> as a counselor. After careful review of your application, we regret to inform you that we are unable to approve your application at this time.
                    </p>

                    ${
                      rejectionReason
                        ? `
                    <!-- Reason Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                          <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                            Reason for Decision:
                          </p>
                          <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                            ${rejectionReason}
                          </p>
                        </td>
                      </tr>
                    </table>
                    `
                        : ''
                    }

                    <!-- Support Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 8px; padding: 24px;">
                          <p style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">
                            📞 Have Questions?
                          </p>
                          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                            If you have questions about this decision or would like more information, please don't hesitate to contact our support team. We're here to help.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Reapply Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background: #f3f4f6; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 20px;">
                          <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">
                            💡 <strong>Future Applications:</strong> You may reapply after addressing the concerns mentioned above. We appreciate your interest in contributing to Solvit’s counselling ecosystem.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                      <tr>
                        <td style="border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                      For questions or clarification, contact us at 
                      <a href="mailto:support@solvitcounselling.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@solvitcounselling.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                    
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_LINKEDIN || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_TWITTER || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_INSTAGRAM || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                              <td style="padding: 0 6px;">
                                <a href="${process.env.SOCIAL_FACEBOOK || '#'}" style="text-decoration: none;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 28px; height: 28px; display: block; opacity: 0.8;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Legal -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px 0;">
                            © ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
                          </p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `APPLICATION UPDATE

Dear ${userName || 'Counselor'},

Thank you for your interest in joining Solvit as a counselor. After careful review of your application, we regret to inform you that we are unable to approve your application at this time.

${rejectionReason ? `REASON FOR DECISION:\n${rejectionReason}\n\n` : ''}HAVE QUESTIONS?
If you have questions about this decision or would like more information, please contact our support team at support@solvitcounselling.com

FUTURE APPLICATIONS:
You may reapply after addressing the concerns mentioned above. We appreciate your interest in contributing to mental health support.

© ${new Date().getFullYear()} Solvit Counseling. All rights reserved.
Solvit Pvt. Ltd. Atal Nagar, Naya Raipur – 493661, India`,
  };

  try {
    return await sendEmailWithRetry(emailOptions);
  } catch (error) {
    console.error('Failed to send rejection email:', error.message);
    throw new Error('Unable to send application update. Please try again later.');
  }
}

export {
  initializeBrevo,
  verifyBrevoConnection,
  sendCounselorRegistrationOTP,
  sendClientRegistrationOTP,
  sendCounselorForgotPasswordOTP,
  sendClientForgotPasswordOTP,
  sendCounselorApplicationSubmitted,
  sendCounselorApplicationApproved,
  sendCounselorApplicationRejected,
};
