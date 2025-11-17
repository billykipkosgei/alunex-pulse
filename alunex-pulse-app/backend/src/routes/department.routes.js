const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const Department = require('../models/Department.model');
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
        cb(null, 'dept-spend-doc-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all departments
router.get('/', protect, async (req, res) => {
    try {
        const departments = await Department.find({
            organization: req.user.organization,
            isActive: true
        })
            .populate('head', 'name email')
            .populate('members', 'name email role')
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create department
router.post('/', protect, async (req, res) => {
    try {
        const department = await Department.create({
            ...req.body,
            organization: req.user.organization
        });
        res.status(201).json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single department
router.get('/:id', protect, async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        })
            .populate('head', 'name email')
            .populate('members', 'name email role')
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get projects by department
router.get('/:id/projects', protect, async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        });

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const projects = await Project.find({
            department: req.params.id,
            organization: req.user.organization
        })
            .populate('manager', 'name email')
            .select('name code budget status priority startDate endDate');

        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update department
router.put('/:id', protect, async (req, res) => {
    try {
        const department = await Department.findOneAndUpdate(
            { _id: req.params.id, organization: req.user.organization },
            req.body,
            { new: true, runValidators: true }
        );
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload spend documentation (Excel file)
router.post('/:id/spend-documentation/upload', protect, upload.single('file'), async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        });
        if (!department) {
            // Delete uploaded file if department not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ message: 'Department not found' });
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
            uploadedBy: req.user.id,
            project: req.body.project || null,
            description: 'Department spend documentation',
            tags: ['spend', 'budget', 'documentation', 'department']
        });

        // Update department with spend documentation
        department.spendDocumentation = {
            excelFile: fileRecord._id,
            documentLink: req.body.documentLink || department.spendDocumentation?.documentLink || '',
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
            notes: req.body.notes || ''
        };

        await department.save();

        const updatedDepartment = await Department.findById(department._id)
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        res.json({ success: true, department: updatedDepartment });
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
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const { documentLink, notes } = req.body;

        // Update or create spend documentation
        department.spendDocumentation = {
            excelFile: department.spendDocumentation?.excelFile || null,
            documentLink: documentLink || '',
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
            notes: notes || ''
        };

        await department.save();

        const updatedDepartment = await Department.findById(department._id)
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        res.json({ success: true, department: updatedDepartment });
    } catch (error) {
        console.error('Error updating spend documentation link:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get spend documentation
router.get('/:id/spend-documentation', protect, async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        })
            .populate('spendDocumentation.excelFile')
            .populate('spendDocumentation.uploadedBy', 'name email');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({ success: true, spendDocumentation: department.spendDocumentation || null });
    } catch (error) {
        console.error('Error fetching spend documentation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete spend documentation
router.delete('/:id/spend-documentation', protect, async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            organization: req.user.organization
        }).populate('spendDocumentation.excelFile');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Delete file from disk if exists
        if (department.spendDocumentation?.excelFile) {
            const file = department.spendDocumentation.excelFile;
            const filePath = path.join(uploadsDir, file.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            // Delete file record from database
            await File.findByIdAndDelete(file._id);
        }

        // Clear spend documentation
        department.spendDocumentation = undefined;
        await department.save();

        res.json({ success: true, message: 'Spend documentation deleted successfully' });
    } catch (error) {
        console.error('Error deleting spend documentation:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
