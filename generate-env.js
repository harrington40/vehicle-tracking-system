const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Define the path to the .env.local file
const envPath = path.join(__dirname, '.env.local');

// Set the expiration to 1 hour in the future
const EXPIRATION_HOURS = 1; // 1 hour

// Generate a new JWT secret and expiration timestamp in UTC
const generateToken = () => {
  const jwtSecret = crypto.randomBytes(32).toString('hex'); // 64 characters, secure random

  // Calculate expiration time exactly 1 hour from now in UTC
  const now = new Date();
  const expirationDate = new Date(now.getTime() + EXPIRATION_HOURS * 60 * 60 * 1000); // 1 hour later in UTC
  const iat = Math.floor(now.getTime() / 1000); // Issued At timestamp in seconds (UTC)
  const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000); // Expiration timestamp in seconds (UTC)

  console.log(`Token Issued At (UTC): ${iat}`);
  console.log(`Token Expiration Time (1 hour later, UTC): ${expirationTimestamp}`);

  return { jwtSecret, iat, expirationTimestamp };
};

// Write or overwrite the .env.local file with JWT secret, iat, and expiration timestamp
const writeEnvFile = (jwtSecret, iat, expirationTimestamp) => {
  const envContent = `JWT_SECRET=${jwtSecret}\nJWT_IAT=${iat}\nJWT_EXPIRATION=${expirationTimestamp}\n`;
  fs.writeFileSync(envPath, envContent, { flag: 'w' });
  console.log('.env.local created with JWT_SECRET, iat, and expiration timestamp.');
};

// Check if .env.local exists; if it does, delete it and generate a new secret
if (fs.existsSync(envPath)) {
  console.log('.env.local exists. Overwriting with a new secret and expiration timestamp.');
  fs.unlinkSync(envPath);
}

const { jwtSecret, iat, expirationTimestamp } = generateToken();
writeEnvFile(jwtSecret, iat, expirationTimestamp);
