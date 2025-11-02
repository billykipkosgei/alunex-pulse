require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const createAdminUser = async () => {
    try {
        await connectDB();

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@alunex.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@alunex.com');
            console.log('You can login with the existing admin account');
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@alunex.com',
            password: 'admin123', // Change this to a secure password
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('═══════════════════════════════════════');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');
        console.log('Role:', adminUser.role);
        console.log('═══════════════════════════════════════');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
