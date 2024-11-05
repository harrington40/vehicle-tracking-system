const bcrypt = require('bcrypt');

async function testHashAndCompare() {
  const originalPassword = 'yourPlainPassword';
  const hashedPassword = await bcrypt.hash(originalPassword, 10);

  const isMatch = await bcrypt.compare(originalPassword, hashedPassword);
  console.log('Password Match:', isMatch);
}

testHashAndCompare();
