const User = require('../models/User.model');
const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const Department = require('../models/Department.model');
const Channel = require('../models/Channel.model');
const Message = require('../models/Message.model');

/**
 * Seed initial data if database is empty
 */
const seedInitialData = async () => {
    try {
        // Check if data already exists
        const projectCount = await Project.countDocuments();

        if (projectCount > 0) {
            console.log('✓ Initial data already seeded');
            return;
        }

        console.log('Seeding initial data...');

        // Get admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('⚠️  No admin user found. Skipping data seed.');
            return;
        }

        // Create departments
        const departments = await Department.insertMany([
            { name: 'Installation', budget: 50000, spent: 32500 },
            { name: 'Quality Control', budget: 30000, spent: 18000 },
            { name: 'Site Management', budget: 40000, spent: 28000 },
            { name: 'Materials', budget: 80000, spent: 64000 }
        ]);

        // Create projects
        const projects = await Project.insertMany([
            {
                name: 'City Center Construction',
                description: 'Large scale aluminum and glass installation project',
                status: 'active',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2026-03-01'),
                manager: adminUser._id
            },
            {
                name: 'Office Complex Renovation',
                description: 'Modern office building glass facade renovation',
                status: 'active',
                startDate: new Date('2025-10-01'),
                endDate: new Date('2026-02-01'),
                manager: adminUser._id
            },
            {
                name: 'Corporate Tower',
                description: 'High-rise corporate tower glass installation',
                status: 'active',
                startDate: new Date('2025-08-15'),
                endDate: new Date('2026-06-30'),
                manager: adminUser._id
            }
        ]);

        // Create tasks
        await Task.insertMany([
            {
                title: 'Aluminum Frame Installation - Building A',
                description: 'Installing aluminum frames on the south facade',
                project: projects[0]._id,
                assignedTo: adminUser._id,
                status: 'in_progress',
                priority: 'high',
                dueDate: new Date('2025-12-20'),
                progress: 65
            },
            {
                title: 'Glass Panel Quality Check',
                description: 'Completed inspection of all panels',
                project: projects[1]._id,
                assignedTo: adminUser._id,
                status: 'completed',
                priority: 'medium',
                dueDate: new Date('2025-11-18'),
                progress: 100,
                completedAt: new Date('2025-11-18')
            },
            {
                title: 'Window Installation - Office Complex',
                description: 'Installing tempered glass windows on floors 3-5',
                project: projects[2]._id,
                assignedTo: adminUser._id,
                status: 'in_progress',
                priority: 'high',
                dueDate: new Date('2025-12-22'),
                progress: 40
            }
        ]);

        // Create channels
        const channels = await Channel.insertMany([
            {
                name: 'General',
                description: 'General team discussion',
                isPrivate: false,
                createdBy: adminUser._id,
                members: [adminUser._id]
            },
            {
                name: 'City Center Project',
                description: 'Discussion for City Center Construction',
                project: projects[0]._id,
                isPrivate: false,
                createdBy: adminUser._id,
                members: [adminUser._id]
            },
            {
                name: 'Office Complex',
                description: 'Discussion for Office Complex Renovation',
                project: projects[1]._id,
                isPrivate: false,
                createdBy: adminUser._id,
                members: [adminUser._id]
            }
        ]);

        // Create welcome messages
        await Message.insertMany([
            {
                channel: channels[0]._id,
                sender: adminUser._id,
                text: 'Welcome to Alunex Pulse! This is the general channel for team communication.',
                readBy: [adminUser._id]
            },
            {
                channel: channels[1]._id,
                sender: adminUser._id,
                text: 'City Center project is progressing well. All materials are on site.',
                readBy: [adminUser._id]
            }
        ]);

        console.log('═══════════════════════════════════════');
        console.log('✓ Initial data seeded successfully!');
        console.log(`  - ${projects.length} projects created`);
        console.log(`  - ${departments.length} departments created`);
        console.log(`  - ${channels.length} channels created`);
        console.log(`  - 3 tasks created`);
        console.log('═══════════════════════════════════════');
    } catch (error) {
        console.error('Error seeding initial data:', error.message);
        // Don't throw - let server continue
    }
};

module.exports = seedInitialData;
