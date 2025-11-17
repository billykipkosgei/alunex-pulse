const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const File = require('../models/File.model');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        // Accept all file types
        cb(null, true);
    }
});

// Get all files
router.get('/', protect, async (req, res) => {
    try {
        const { project } = req.query;
        const query = { organization: req.user.organization };
        if (project) query.project = project;

        const files = await File.find(query)
            .populate('uploadedBy', 'name email')
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, files });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});

// Upload file
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { project, description, tags } = req.body;

        const file = await File.create({
            name: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/api/files/download/${req.file.filename}`,
            organization: req.user.organization,
            project: project || null,
            uploadedBy: req.user.id,
            description: description || '',
            tags: tags ? JSON.parse(tags) : []
        });

        const populatedFile = await File.findById(file._id)
            .populate('uploadedBy', 'name email')
            .populate('project', 'name');

        res.status(201).json({ success: true, file: populatedFile });
    } catch (error) {
        console.error('Error uploading file:', error);
        // Delete the uploaded file if database save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error uploading file' });
    }
});

// Download file
router.get('/download/:filename', protect, async (req, res) => {
    try {
        const file = await File.findOne({
            name: req.params.filename,
            organization: req.user.organization
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(uploadsDir, req.params.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, file.originalName);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

// Delete file
router.delete('/:id', protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from disk
        const filePath = path.join(uploadsDir, file.name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await File.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

module.exports = router;
