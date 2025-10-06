import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config({ path: './.env' });
// Create a transporter using Gmail and environment credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
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
    throw error;
  }
};

export { sendEmail };
