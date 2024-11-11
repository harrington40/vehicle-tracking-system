import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined. Please set it in your .env.local file.");
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired' };
    } else if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token' };
    } else {
      return { error: 'Token verification failed' };
    }
  }
}