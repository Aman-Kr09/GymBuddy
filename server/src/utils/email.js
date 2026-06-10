import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email for password reset
 */
export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"GymBuddy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP - GymBuddy',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a1a;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="color: #39FF14; font-size: 28px; margin-bottom: 8px;">💪 GymBuddy</h1>
          <p style="color: #888; font-size: 14px; margin-bottom: 30px;">Password Reset Request</p>
          <div style="background: #111; border-radius: 12px; padding: 30px; margin-bottom: 24px;">
            <p style="color: #ccc; font-size: 14px; margin-bottom: 16px;">Your OTP code is:</p>
            <div style="font-size: 36px; font-weight: 700; color: #39FF14; letter-spacing: 8px; margin-bottom: 16px;">${otp}</div>
            <p style="color: #666; font-size: 12px;">This code expires in 10 minutes</p>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

/**
 * Generate a 6-digit OTP
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
