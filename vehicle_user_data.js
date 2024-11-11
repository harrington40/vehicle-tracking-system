const r = require('rethinkdbdash')({
    host: 'localhost',
    port: 28015,
    db: 'vehicle_tracking'
  });
  const bcrypt = require('bcryptjs');
  
  // Function to generate a 6-digit ID
  function generate6DigitId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // User details
  const userData = {
    email: 'hricks@go.com',
    id: generate6DigitId(),
    vehicle_year: 2023
  };
  
  // Plain password
  const plainPassword = 'Cosinesine';
  
  // Hash the password
  bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    
    // Add hashed password to user data
    userData.password = hashedPassword;
  
    // Insert user data into Users table
    r.table('Users').insert(userData)
      .then(result => {
        console.log('User added:', result);
      })
      .catch(error => {
        console.error('Error inserting user into database:', error);
      })
      .finally(() => {
        // Close the RethinkDB connection
        r.getPoolMaster().drain();
      });
  });
  