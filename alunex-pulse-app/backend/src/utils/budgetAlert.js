const { sendBudgetAlertEmail } = require('./emailService');

// Check and send budget alerts for a department
exports.checkDepartmentBudget = async (department) => {
    try {
        const budgetAllocated = parseFloat(department.budget?.allocated || 0);
        const budgetSpent = parseFloat(department.budget?.spent || 0);

        if (budgetAllocated === 0) {
            return; // No budget set
        }

        const percentage = Math.round((budgetSpent / budgetAllocated) * 100);

        // Send alerts at 75%, 90%, and 100% thresholds
        const thresholds = [75, 90, 100];
        for (const threshold of thresholds) {
            if (percentage >= threshold) {
                await sendDepartmentBudgetAlert(department, budgetAllocated, budgetSpent, percentage);
                break; // Only send one alert (the highest threshold exceeded)
            }
        }
    } catch (error) {
        console.error('Error checking department budget:', error);
    }
};

// Send budget alert for department
async function sendDepartmentBudgetAlert(department, budgetAllocated, budgetSpent, percentage) {
    try {
        const User = require('../models/User.model');

        // Get department head and notify
        if (department.head) {
            const headUser = await User.findById(department.head).select('name email preferences');

            if (headUser && headUser.preferences?.notifications?.email && headUser.preferences?.notifications?.budgetAlerts) {
                await sendBudgetAlertEmail(
                    headUser.email,
                    headUser.name,
                    'Department',
                    department.name,
                    budgetAllocated,
                    budgetSpent,
                    percentage
                );
                console.log(`Budget alert sent to department head: ${headUser.email}`);
            }
        }

        // Also notify all admins in the organization
        const admins = await User.find({
            organization: department.organization,
            role: 'admin'
        }).select('name email preferences');

        for (const admin of admins) {
            if (admin.preferences?.notifications?.email && admin.preferences?.notifications?.budgetAlerts) {
                await sendBudgetAlertEmail(
                    admin.email,
                    admin.name,
                    'Department',
                    department.name,
                    budgetAllocated,
                    budgetSpent,
                    percentage
                );
                console.log(`Budget alert sent to admin: ${admin.email}`);
            }
        }
    } catch (error) {
        console.error('Error sending department budget alert:', error);
    }
}

// Check and send budget alerts for a project
exports.checkProjectBudget = async (project) => {
    try {
        const budgetAllocated = parseFloat(project.budget?.allocated || 0);
        const budgetSpent = parseFloat(project.budget?.spent || 0);

        if (budgetAllocated === 0) {
            return; // No budget set
        }

        const percentage = Math.round((budgetSpent / budgetAllocated) * 100);

        // Send alerts at 75%, 90%, and 100% thresholds
        const thresholds = [75, 90, 100];
        for (const threshold of thresholds) {
            if (percentage >= threshold) {
                await sendProjectBudgetAlert(project, budgetAllocated, budgetSpent, percentage);
                break; // Only send one alert (the highest threshold exceeded)
            }
        }
    } catch (error) {
        console.error('Error checking project budget:', error);
    }
};

// Send budget alert for project
async function sendProjectBudgetAlert(project, budgetAllocated, budgetSpent, percentage) {
    try {
        const User = require('../models/User.model');

        // Notify project manager
        if (project.manager) {
            const managerId = project.manager._id || project.manager;
            const manager = await User.findById(managerId).select('name email preferences');

            if (manager && manager.preferences?.notifications?.email && manager.preferences?.notifications?.budgetAlerts) {
                await sendBudgetAlertEmail(
                    manager.email,
                    manager.name,
                    'Project',
                    project.name,
                    budgetAllocated,
                    budgetSpent,
                    percentage
                );
                console.log(`Budget alert sent to project manager: ${manager.email}`);
            }
        }

        // Also notify all admins in the organization
        const admins = await User.find({
            organization: project.organization,
            role: 'admin'
        }).select('name email preferences');

        for (const admin of admins) {
            if (admin.preferences?.notifications?.email && admin.preferences?.notifications?.budgetAlerts) {
                await sendBudgetAlertEmail(
                    admin.email,
                    admin.name,
                    'Project',
                    project.name,
                    budgetAllocated,
                    budgetSpent,
                    percentage
                );
                console.log(`Budget alert sent to admin: ${admin.email}`);
            }
        }
    } catch (error) {
        console.error('Error sending project budget alert:', error);
    }
}
