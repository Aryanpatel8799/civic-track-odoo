const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@civictrack.com' });
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo users
    const demoUsers = [
      {
        username: 'demo_user',
        email: 'demo@civictrack.com',
        password: 'demo123',
        phone: '1234567890',
        role: 'user',
        isActive: true
      },
      {
        username: 'admin_user',
        email: 'admin@civictrack.com',
        password: 'admin123',
        phone: '1234567891',
        role: 'admin',
        isActive: true
      }
    ];

    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Demo users created successfully!');
    console.log('\nLogin credentials:');
    console.log('User: demo@civictrack.com / demo123');
    console.log('Admin: admin@civictrack.com / admin123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedUsers();
