// pages/api/verify-reset-token.js

import { findUserByResetToken } from '../../lib/database'; // replace with actual path

export default async function handler(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' });
  }

  try {
    const user = await findUserByResetToken(token); // Implement this in your database logic
    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token.' });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Server error.' });
  }
}
