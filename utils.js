import bcrypt from 'bcrypt';
import db from './db.js'
import { randomInt } from 'crypto';


// Hash a password for storage
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Compare a plain text password with its hashed version
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const generateItemUniqueItemId = async () => {
  let uniqueId;
  do {
    uniqueId = randomInt(10000000000);
    const existingItem = await db.cart.findOne({ "item_unique_id": uniqueId });
  } while (existingItem);

  return uniqueId;
};
const generateProductUniqueItemId = async () => {
  let uniqueId;
  do {
    uniqueId = randomInt(10000000000);
    const existingItem = await db.products.findOne({ "product_id": uniqueId });
  } while (existingItem);

  return uniqueId;
};

export {hashPassword,comparePassword,generateItemUniqueItemId,generateProductUniqueItemId};