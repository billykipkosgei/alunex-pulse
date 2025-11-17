require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const User = require('../models/User.model');
const Department = require('../models/Department.model');
const Channel = require('../models/Channel.model');
const Message = require('../models/Message.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Get the existing user
        const user = await User.findOne({ email: 'john@alunex.com' });
        if (!user) {
            console.log('Please create a user first');
            process.exit(1);
        }

        // Clear existing data
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Department.deleteMany({});
        await Channel.deleteMany({});
        await Message.deleteMany({});

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
                manager: user._id
            },
            {
                name: 'Office Complex Renovation',
                description: 'Modern office building glass facade renovation',
                status: 'active',
                startDate: new Date('2025-10-01'),
                endDate: new Date('2026-02-01'),
                manager: user._id
            },
            {
                name: 'Corporate Tower',
                description: 'High-rise corporate tower glass installation',
                status: 'active',
                startDate: new Date('2025-08-15'),
                endDate: new Date('2026-06-30'),
                manager: user._id
            },
            {
                name: 'Residential Building',
                description: 'Residential complex window installation',
                status: 'active',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2026-04-30'),
                manager: user._id
            },
            {
                name: 'Shopping Mall Facade',
                description: 'Shopping mall exterior glass facade',
                status: 'active',
                startDate: new Date('2025-09-15'),
                endDate: new Date('2026-05-15'),
                manager: user._id
            }
        ]);

        // Create tasks
        await Task.insertMany([
            {
                title: 'Aluminum Frame Installation - Building A',
                description: 'Installing aluminum frames on the south facade',
                project: projects[0]._id,
                assignedTo: user._id,
                status: 'in_progress',
                priority: 'high',
                dueDate: new Date('2025-10-20'),
                progress: 65
            },
            {
                title: 'Glass Panel Quality Check',
                description: 'Completed inspection of all panels',
                project: projects[1]._id,
                assignedTo: user._id,
                status: 'completed',
                priority: 'medium',
                dueDate: new Date('2025-10-18'),
                progress: 100,
                completedAt: new Date('2025-10-18')
            },
            {
                title: 'Window Installation - Office Complex',
                description: 'Installing tempered glass windows on floors 3-5',
                project: projects[2]._id,
                assignedTo: user._id,
                status: 'in_progress',
                priority: 'high',
                dueDate: new Date('2025-10-22'),
                progress: 40
            },
            {
                title: 'Safety Inspection - Site B',
                description: 'Conduct safety inspection before installation begins',
                project: projects[3]._id,
                assignedTo: user._id,
                status: 'todo',
                priority: 'high',
                dueDate: new Date('2025-10-19')
            },
            {
                title: 'Material Order - Aluminum Sheets',
                description: 'Order 200 aluminum sheets for Building A facade',
                project: projects[4]._id,
                assignedTo: user._id,
                status: 'blocked',
                priority: 'high',
                dueDate: new Date('2025-10-21')
            },
            {
                title: 'Blueprint Review - Building C',
                description: 'Review and approve updated blueprints',
                project: projects[0]._id,
                assignedTo: user._id,
                status: 'todo',
                priority: 'medium',
                dueDate: new Date('2025-10-20')
            },
            {
                title: 'Quality Control Check - Panels',
                description: 'Inspecting glass panels for defects',
                project: projects[1]._id,
                assignedTo: user._id,
                status: 'in_progress',
                priority: 'medium',
                dueDate: new Date('2025-10-19'),
                progress: 80
            },
            {
                title: 'Site Preparation - Building A',
                description: 'Completed site cleanup and preparation',
                project: projects[0]._id,
                assignedTo: user._id,
                status: 'completed',
                priority: 'high',
                dueDate: new Date('2025-10-17'),
                progress: 100,
                completedAt: new Date('2025-10-17')
            }
        ]);

        // Create channels
        const channels = await Channel.insertMany([
            {
                name: 'General',
                description: 'General team discussion',
                isPrivate: false,
                createdBy: user._id,
                members: [user._id]
            },
            {
                name: 'City Center Project',
                description: 'Discussion for City Center Construction',
                project: projects[0]._id,
                isPrivate: false,
                createdBy: user._id,
                members: [user._id]
            },
            {
                name: 'Office Complex',
                description: 'Discussion for Office Complex Renovation',
                project: projects[1]._id,
                isPrivate: false,
                createdBy: user._id,
                members: [user._id]
            }
        ]);

        // Create some initial messages
        await Message.insertMany([
            {
                channel: channels[0]._id,
                sender: user._id,
                text: 'Welcome to the team chat! Feel free to discuss anything here.',
                readBy: [user._id]
            },
            {
                channel: channels[1]._id,
                sender: user._id,
                text: 'City Center project is progressing well. All materials are on site.',
                readBy: [user._id]
            },
            {
                channel: channels[1]._id,
                sender: user._id,
                text: 'Next phase starts tomorrow morning at 8 AM.',
                readBy: [user._id]
            }
        ]);

        console.log('Sample data seeded successfully!');
        console.log(`Created ${projects.length} projects and 8 tasks`);
        console.log(`Created ${departments.length} departments`);
        console.log(`Created ${channels.length} channels with initial messages`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
