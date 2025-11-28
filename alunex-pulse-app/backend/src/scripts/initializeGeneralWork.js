const Project = require('../models/Project.model');
const Organization = require('../models/Organization.model');

const initializeGeneralWork = async () => {
    try {
        // Get all organizations
        const organizations = await Organization.find({ isActive: true });

        if (organizations.length === 0) {
            console.log('ℹ️  No organizations found - General Work projects will be created when organizations are created');
            return;
        }

        // Create General Work project for each organization if it doesn't exist
        for (const org of organizations) {
            const existingProject = await Project.findOne({
                name: 'General Work',
                organization: org._id
            });

            if (!existingProject) {
                await Project.create({
                    name: 'General Work',
                    code: `GENERAL-${org.slug.toUpperCase()}`,
                    description: 'Non-project work including meetings, training, admin tasks, and other general activities',
                    status: 'active',
                    priority: 'low',
                    organization: org._id
                });
                console.log(`✅ General Work project created for organization: ${org.name}`);
            } else {
                console.log(`✅ General Work project already exists for organization: ${org.name}`);
            }
        }
    } catch (error) {
        console.error('Error initializing General Work project:', error);
    }
};

module.exports = initializeGeneralWork;
