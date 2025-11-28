const User = require('../models/User.model');
const Organization = require('../models/Organization.model');

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

        // Create default organization for admin
        const defaultOrg = await Organization.create({
            name: 'Alunex Default Organization',
            plan: 'enterprise'
        });

        console.log('✓ Default organization created:', defaultOrg.name);

        // Create default admin user
        const defaultAdmin = {
            name: 'Admin User',
            email: 'admin@alunex.in',
            password: 'admin123', // Will be hashed by the User model pre-save hook
            role: 'admin',
            organization: defaultOrg._id,
            isActive: true
        };

        const adminUser = await User.create(defaultAdmin);

        // Update organization owner
        defaultOrg.owner = adminUser._id;
        await defaultOrg.save();

        console.log('═══════════════════════════════════════');
        console.log('✓ Default admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');
        console.log('Organization:', defaultOrg.name);
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('═══════════════════════════════════════');
    } catch (error) {
        console.error('Error initializing admin user:', error.message);
        // Don't throw error - let the server continue to run
    }
};

module.exports = initializeAdmin;
