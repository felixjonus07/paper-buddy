require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edufin');
    console.log('Connected to MongoDB for seeding...');

    // Drop the old email index if it exists
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('Dropped old email_1 index.');
    } catch (e) {
      console.log('No email_1 index found, proceeding...');
    }

    // Clear existing users to avoid duplicates
    await User.deleteMany();
    console.log('Cleared existing users.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const users = [
      {
        name: 'System Admin',
        username: 'admin',
        password: adminPassword,
        role: 'admin'
      },
      {
        name: 'John Student',
        username: 'student',
        password: studentPassword,
        role: 'user'
      }
    ];

    await User.insertMany(users);
    console.log('Seeded admin and student users successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
