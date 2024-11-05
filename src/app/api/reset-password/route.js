import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs'; // For hashing passwords
import { v4 as uuidv4 } from 'uuid';


// List of common spam domains
const blockedDomains = ['spamdomain.com', 'anotherbadmail.com', 'disposablemail.com'];

// Utility function to check for spam domains
const isSpamDomain = (email) => {
  const domain = email.split('@')[1];
  return blockedDomains.includes(domain);
};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Mock database functions (replace with actual database logic)
const findUserByEmail = async (email) => {
  // Replace this with actual database query to find the user by email
  return email === 'existinguser@example.com' ? { id: 1, email } : null;
};

const saveResetToken = async (userId, resetToken) => {
  // Replace this with actual database logic to save the reset token for the user
  console.log(`Reset token saved for user ID ${userId}: ${resetToken}`);
  return true;
};

export async function POST(req) {
  const { email } = await req.json();

  // Check if the email is from a spam domain
  if (isSpamDomain(email)) {
    return new Response(JSON.stringify({ message: 'Invalid email domain' }), { status: 400 });
  }

  // Verify the email exists in the database
  const user = await findUserByEmail(email);
  if (!user) {
    return new Response(JSON.stringify({ message: 'Email not found' }), { status: 404 });
  }

  // Generate a unique reset token
  const resetToken = uuidv4();

  // Save the reset token in the database
  const saveResult = await saveResetToken(user.id, resetToken);
  if (!saveResult) {
    return new Response(JSON.stringify({ message: 'Failed to save reset token' }), { status: 500 });
  }

  // Create a reset link with the token
  const resetLink = `http://localhost:3003/reset-password?token=${resetToken}`;

  // Prepare the email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
  };

  try {
    // Send the password reset email
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Password reset link sent to your email!' }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ message: 'Failed to send email', error: error.message }), { status: 500 });
  }
}
