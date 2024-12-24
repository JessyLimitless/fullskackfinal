const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

app.use(express.static(__dirname));

// Route to upload PDF and extract text
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const pdfBuffer = req.file.buffer;
        const data = await pdfParse(pdfBuffer); 
        const allPages = data.text.split('\n\n'); // Split pages by double newline
        const first10Pages = allPages.slice(0, 10).join('\n\n'); // Extract the first 10 pages
        res.json({ text: first10Pages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.timeout = 10 * 60 * 1000; // Set server timeout to 10 minutes
