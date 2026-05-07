/**
 * Email Service for Midiscanai using Nodemailer
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  /**
   * Sends a verification email
   */
  static async sendVerificationEmail(toEmail, fullName, verificationLink) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h1 style="color: #1E40AF;">Midiscanai</h1>
        <h2>Welcome to Midiscanai — Verify Your Email</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for creating your Midiscanai account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #1E40AF; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; display: inline-block;">Verify My Email</a>
        </div>
        <p style="font-size: 0.875rem;">This link expires in 24 hours. If you did not create this account, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="font-size: 0.75rem; color: #6B7280;">MediScan AI provides informational insights only. Always consult a licensed medical professional.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"Midiscanai" <noreply@midiscanai.com>',
        to: toEmail,
        subject: "Verify your Midiscanai account",
        html,
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }
  }

  /**
   * Sends a password reset email
   */
  static async sendPasswordResetEmail(toEmail, fullName, resetLink) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h1 style="color: #1E40AF;">Midiscanai</h1>
        <h2>Reset Your Password</h2>
        <p>Hello ${fullName},</p>
        <p>We received a request to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #DC2626; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; display: inline-block;">Reset My Password</a>
        </div>
        <p style="font-size: 0.875rem;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="font-size: 0.75rem; color: #6B7280;">MediScan AI provides informational insights only. Always consult a licensed medical professional.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"Midiscanai" <noreply@midiscanai.com>',
        to: toEmail,
        subject: "Reset your Midiscanai password",
        html,
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }
  }

  /**
   * Sends a notification that analysis is complete
   */
  static async sendAnalysisCompleteEmail(toEmail, fullName, conditionLevel, detectedCondition) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h1 style="color: #1E40AF;">Midiscanai</h1>
        <h2>Your Medical Analysis is Ready</h2>
        <p>Hello ${fullName},</p>
        <p>The AI Agent has completed the analysis of your medical report.</p>
        <p><strong>Detected Condition:</strong> ${detectedCondition}</p>
        <p><strong>Condition Level:</strong> ${conditionLevel}</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="font-size: 0.75rem; color: #6B7280;">MediScan AI provides informational insights only. Always consult a licensed medical professional.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"Midiscanai" <noreply@midiscanai.com>',
        to: toEmail,
        subject: "Your medical report analysis is ready",
        html,
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }
  }
}
