const User = require('../models/user');
const bcrypt = require('bcrypt');
const ROLES = require('./roles');


require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 
'mongodb://root:2002@localhost:27017/marketing-app?authSource=admin';
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || '12345678';
const saltRounds = process.env.SALT_ROUNDS || 10;

async function seedAdmin() {

  const adminExists = await User.getByRole(username);
  
  if (!adminExists) {
    await User.create({
        username: username,
        password,
        roles: [ROLES.ADMIN],
        isVerified: true
    });

    console.log(`Admin account created successfully with username: ${username}, password: ${password}`);
  } else {
    console.log('Admin account already exists');
  }
}

seedAdmin().catch(console.error);