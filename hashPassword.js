const bcrypt = require('bcryptjs');

// Replace 'your_plain_password' with the user's actual plaintext password
const plaintextPassword = 'mypassword123';

bcrypt.hash(plaintextPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
});
