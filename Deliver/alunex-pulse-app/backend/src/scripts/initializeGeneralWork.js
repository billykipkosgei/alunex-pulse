const Project = require('../models/Project.model');

const initializeGeneralWork = async () => {
    try {
        // Check if General Work project exists
        const existingProject = await Project.findOne({ name: 'General Work' });

        if (!existingProject) {
            // Create General Work project
            await Project.create({
                name: 'General Work',
                code: 'GENERAL',
                description: 'Non-project work including meetings, training, admin tasks, and other general activities',
                status: 'active',
                priority: 'low'
            });
            console.log('✅ General Work project created successfully');
        } else {
            console.log('✅ General Work project already exists');
        }
    } catch (error) {
        console.error('Error initializing General Work project:', error);
    }
};

module.exports = initializeGeneralWork;
