import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  // Agregamos el /#/ antes de la ruta verify
const verifyUrl = `${process.env.FRONTEND_URL}/#/verify?token=${token}`;

  const mailOptions = {
    from: `"Snippet Manager Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome! Please verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Snippet Manager!</h2>
        <p>Thank you for registering. To complete your setup and secure your account, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};