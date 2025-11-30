const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const Project = require('../models/Project.model');
const File = require('../models/File.model');

// Configure multer for spend documentation uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'spend-doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        // Accept Excel files and other common document formats
        const allowedTypes = /xlsx|xls|csv|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only Excel, CSV, PDF, and Word documents are allowed'));
    }
});

// Get all projects
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find({ organization: req.user.organization })
            .populate('manager', 'name email')
            .populate('team.user', 'name email')
            .populate('client', 'name email')
            .populate('department', 'name')
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create project
router.post('/', protect, async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            organization: req.user.organization
        };

        // Ensure empty strings for department are set to null/undefined
        if (projectData.department === '') {
            delete projectData.department;
        }

        const project = await Project.create(projectData);

        // Populate department before sending response
        await project.populate('department', 'name');

        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            organization: req.user.organization
        })
            .populate('manager', 'name email')
            .populate('team.user', 'name email')
            .populate('client', 'name email')
            .populate('department', 'name')
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update project
router.put('/:id', protect, async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Ensure empty strings for department are set to null
        if (updateData.department === '') {
            updateData.department = null;
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, organization: req.user.organization },
            updateData,
            { new: true, runValidators: true }
        )
            .populate('manager', 'name email')
            .populate('team.user', 'name email')
            .populate('client', 'name email')
            .populate('department', 'name')
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Send notification to team members about project update
        if (project.team && project.team.length > 0) {
            const User = require('../models/User.model');
            const emailService = require('../utils/emailService');
            const updatedBy = await User.findById(req.user.id).select('name');

            for (const teamMember of project.team) {
                try {
                    const user = await User.findById(teamMember.user._id || teamMember.user).select('name email preferences');

                    // Check if user has email and project update notifications enabled
                    if (user && user.preferences?.notifications?.email && user.preferences?.notifications?.projectUpdates) {
                        await emailService.sendProjectUpdateEmail(
                            user.email,
                            user.name,
                            project.name,
                            'updated',
                            updatedBy.name
                        );
                        console.log(`Project update notification sent to ${user.email}`);
                    }
                } catch (emailError) {
                    console.error(`Error sending project notification to user:`, emailError);
                }
            }

            // Also notify project manager if not already in team
            if (project.manager) {
                try {
                    const managerId = project.manager._id || project.manager;
                    const isInTeam = project.team.some(tm => (tm.user._id || tm.user).toString() === managerId.toString());

                    if (!isInTeam) {
                        const manager = await User.findById(managerId).select('name email preferences');
                        if (manager && manager.preferences?.notifications?.email && manager.preferences?.notifications?.projectUpdates) {
                            await emailService.sendProjectUpdateEmail(
                                manager.email,
                                manager.name,
                                project.name,
                                'updated',
                                updatedBy.name
                            );
                            console.log(`Project update notification sent to manager ${manager.email}`);
                        }
                    }
                } catch (emailError) {
                    console.error(`Error sending project notification to manager:`, emailError);
                }
            }
        }

        // Check budget alerts if budget was updated
        if (updateData.budget) {
            const budgetAlert = require('../utils/budgetAlert');
            await budgetAlert.checkProjectBudget(project);
        }

        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload spend documentation (Excel file)
router.post('/:id/spend-documentation/upload', protect, upload.single('file'), async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            organization: req.user.organization
        });
        if (!project) {
            // Delete uploaded file if project not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create file record
        const fileRecord = await File.create({
            name: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/api/files/download/${req.file.filename}`,
            organization: req.user.organization,
            project: project._id,
            uploadedBy: req.user.id,
            description: 'Spend documentation',
            tags: ['spend', 'budget', 'documentation']
        });

        // Update project with spend documentation
        project.spendDocumentation = {
            excelFile: fileRecord._id,
            documentLink: req.body.documentLink || project.spendDocumentation?.documentLink || '',
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
            notes: req.body.notes || ''
        };

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        res.json({ success: true, project: updatedProject });
    } catch (error) {
        console.error('Error uploading spend documentation:', error);
        // Delete uploaded file if database save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
});

// Update spend documentation link (without file upload)
router.put('/:id/spend-documentation/link', protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            organization: req.user.organization
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { documentLink, notes } = req.body;

        // Update or create spend documentation
        project.spendDocumentation = {
            excelFile: project.spendDocumentation?.excelFile || null,
            documentLink: documentLink || '',
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
            notes: notes || ''
        };

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        res.json({ success: true, project: updatedProject });
    } catch (error) {
        console.error('Error updating spend documentation link:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get spend documentation
router.get('/:id/spend-documentation', protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            organization: req.user.organization
        })
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ success: true, spendDocumentation: project.spendDocumentation || null });
    } catch (error) {
        console.error('Error fetching spend documentation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete spend documentation
router.delete('/:id/spend-documentation', protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            organization: req.user.organization
        }).populate('spendDocumentation.excelFile');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete file from disk if exists
        if (project.spendDocumentation?.excelFile) {
            const file = project.spendDocumentation.excelFile;
            const filePath = path.join(uploadsDir, file.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            // Delete file record from database
            await File.findByIdAndDelete(file._id);
        }

        // Clear spend documentation
        project.spendDocumentation = undefined;
        await project.save();

        res.json({ success: true, message: 'Spend documentation deleted successfully' });
    } catch (error) {
        console.error('Error deleting spend documentation:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
