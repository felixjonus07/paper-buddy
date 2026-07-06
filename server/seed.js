require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edufin');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users to avoid duplicates
    await User.deleteMany();
    console.log('Cleared existing users.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const users = [
      {
        name: 'System Admin',
        email: 'admin@paperbuddy.com',
        password: adminPassword,
        role: 'admin'
      },
      {
        name: 'John Student',
        email: 'student@paperbuddy.com',
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
