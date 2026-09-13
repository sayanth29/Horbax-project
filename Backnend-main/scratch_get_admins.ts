import mongoose from 'mongoose';
import Admin from './src/models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');
    const admins = await Admin.find({});
    console.log('Admin Usernames in Database:');
    admins.forEach(a => console.log('-', a.username));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

run();
