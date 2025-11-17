const User = require('../models/User.model');

/**
 * Initialize admin user on startup
 * Creates a default admin user if no admin exists
 */
const initializeAdmin = async () => {
    try {
        // Check if any admin user exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('✓ Admin user already exists');
            return;
        }

        // Create default admin user
        const defaultAdmin = {
            name: 'Admin User',
            email: 'admin@alunex.in',
            password: 'admin123', // Will be hashed by the User model pre-save hook
            role: 'admin',
            isActive: true
        };

        const adminUser = await User.create(defaultAdmin);

        console.log('═══════════════════════════════════════');
        console.log('✓ Default admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('═══════════════════════════════════════');
    } catch (error) {
        console.error('Error initializing admin user:', error.message);
        // Don't throw error - let the server continue to run
    }
};

module.exports = initializeAdmin;
