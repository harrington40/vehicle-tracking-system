const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Define the path to the .env.local file
const envPath = path.join(__dirname, '.env.local');

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  console.log('.env.local already exists. Skipping secret generation.');
} else {
  // Generate a random secret using crypto
  const jwtSecret = crypto.randomBytes(32).toString('hex'); // 64 characters, secure random

  // Prepare the content for .env.local
  const envContent = `JWT_SECRET=${jwtSecret}\n`;

  // Write the content to .env.local
  fs.writeFileSync(envPath, envContent, { flag: 'w' });
  console.log(`.env.local created with JWT_SECRET.`);
}
