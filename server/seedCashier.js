require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedCashier = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edufin');
    console.log('Connected to DB');

    const existingUser = await User.findOne({ username: 'cashier' });
    if (existingUser) {
      console.log('Cashier user already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash('cashier123', salt);
      existingUser.role = 'cashier';
      await existingUser.save();
      console.log('Cashier user updated successfully.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('cashier123', salt);
      await User.create({
        name: 'Main Cashier',
        username: 'cashier',
        password: hashedPassword,
        role: 'cashier'
      });
      console.log('Cashier user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding cashier:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedCashier();
