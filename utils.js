import bcrypt from 'bcrypt';

// Hash a password for storage
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Compare a plain text password with its hashed version
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export {hashPassword,comparePassword};