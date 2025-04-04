require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 
'mongodb://root:2002@localhost:27017/marketing-app?authSource=admin';

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;