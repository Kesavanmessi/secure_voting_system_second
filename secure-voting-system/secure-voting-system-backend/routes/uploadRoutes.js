const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Candidate = require('../models/Candidates');
const Voter = require('../models/Voters');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer
const upload = multer({ dest: uploadDir });

// Helper to delete file
const deleteFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
    });
};

// Upload Candidates
router.post('/candidates', upload.single('file'), async (req, res) => {
    const { listname } = req.body;
    const file = req.file;

    if (!file || !listname) {
        return res.status(400).json({ success: false, message: "File and listname are required." });
    }

    try {
        // Check if list exists
        if (await Candidate.findOne({ listname })) {
            deleteFile(file.path);
            return res.status(400).json({ success: false, message: "Candidate list with this name already exists." });
        }

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            throw new Error("Excel sheet is empty.");
        }

        const candidates = data.map(row => {
            if (!row.candidateId || !row.candidateName) {
                throw new Error("Excel sheet must contain 'candidateId' and 'candidateName' columns.");
            }
            return row;
        });

        // Add NOTA if not present
        const hasNota = candidates.some(c => c.candidateId === 'C1NOTA2');
        if (!hasNota) {
            candidates.push({
                candidateId: 'C1NOTA2',
                candidateName: 'None of the Above',
                party: 'NOTA'
            });
        }

        const newCandidateList = new Candidate({
            listname,
            candidates
        });

        await newCandidateList.save();
        deleteFile(file.path);
        res.status(201).json({ success: true, message: "Candidate list uploaded successfully." });

    } catch (error) {
        if (file) deleteFile(file.path);
        console.error("Error processing candidate upload:", error);
        res.status(500).json({ success: false, message: error.message || "Error processing file." });
    }
});

// Upload Voters
router.post('/voters', upload.single('file'), async (req, res) => {
    const { listname } = req.body;
    const file = req.file;

    if (!file || !listname) {
        return res.status(400).json({ success: false, message: "File and listname are required." });
    }

    try {
        // Check if list exists
        if (await Voter.findOne({ listname })) {
            deleteFile(file.path);
            return res.status(400).json({ success: false, message: "Voter list with this name already exists." });
        }

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            throw new Error("Excel sheet is empty.");
        }

        const voters = data.map(row => {
            if (!row.voterId || !row.voterName || !row.email || !row.address || !row.age) {
                throw new Error("Excel sheet must contain voterId, voterName, email, address, age.");
            }
            // Generate password if not present
            if (!row.password) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                let password = '';
                for (let i = 0; i < 12; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                row.password = password;
            }
            return row;
        });

        const newVoterList = new Voter({
            listname,
            voters
        });

        await newVoterList.save();
        deleteFile(file.path);
        res.status(201).json({ success: true, message: "Voter list uploaded successfully." });

    } catch (error) {
        if (file) deleteFile(file.path);
        console.error("Error processing voter upload:", error);
        res.status(500).json({ success: false, message: error.message || "Error processing file." });
    }
});

module.exports = router;
