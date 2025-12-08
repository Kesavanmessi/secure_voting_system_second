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

        const candidates = data.map((row, index) => {
            const rowCandidateName = row.candidateName || row.CandidateName || row.Name || row.name;
            let rowCandidateId = row.candidateId || row.CandidateId || row.ID || row.id;
            const rowProfile = row.profile || row.Profile || row.image || row.Image || null;
            const rowEmail = row.email || row.Email || null;

            if (!rowCandidateName) {
                throw new Error("Excel sheet must contain 'candidateName' column.");
            }

            // Auto-generate ID if missing: First 4 letters of listname + "C" + numeric unique
            if (!rowCandidateId) {
                const prefix = listname.substring(0, 4).toUpperCase().padEnd(4, 'X');
                const numeric = Date.now().toString().slice(-6) + index; // timestamp suffix
                rowCandidateId = `${prefix}C${numeric}`;
            }

            return {
                candidateId: rowCandidateId,
                candidateName: rowCandidateName,
                profile: rowProfile,
                email: rowEmail
            };
        });

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

        const voters = data.map((row, index) => {
            let rowVoterId = row.voterId || row.VoterId || row.ID || row.id;
            const rowVoterName = row.voterName || row.VoterName || row.Name || row.name;
            const rowEmail = row.email || row.Email;
            const rowAddress = row.address || row.Address;
            const rowAge = row.age || row.Age;

            if (!rowVoterName || !rowEmail || !rowAddress || !rowAge) {
                throw new Error("Excel sheet must contain voterName, email, address, age.");
            }

            // Auto-generate ID if missing: First 4 letters of listname + "V" + numeric unique
            if (!rowVoterId) {
                const prefix = listname.substring(0, 4).toUpperCase().padEnd(4, 'X');
                const numeric = Date.now().toString().slice(-6) + index;
                rowVoterId = `${prefix}V${numeric}`;
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

            return {
                ...row,
                voterId: rowVoterId,
                voterName: rowVoterName,
                email: rowEmail,
                address: rowAddress,
                age: rowAge,
                password: row.password
            };
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
