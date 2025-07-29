import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({ path: "./.env" });
// Create a transporter using Gmail and environment credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Solvit" <${process.env.EMAIL}>`,
      to,
      subject,
      text, // plain‑text body
      // html: "<b>Hello world?</b>", // HTML body
    });

    return info;
  } catch (error) {
    console.log("ERROR Sending OTP:", error);
  }
};

export { sendEmail , transporter};
