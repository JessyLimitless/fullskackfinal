const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve(__dirname, 'diary.txt');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.post('/save-text', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'No text provided' });
    }

    fs.writeFile(DATA_FILE, text, 'utf8', (err) => {
        if (err) {
            console.error('Error saving text:', err);
            return res.status(500).json({ message: 'Failed to save text' });
        }
        res.json({ message: 'Text saved successfully' });
    });
});

app.get('/get-diary', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading diary:', err);
            return res.status(500).json({ message: 'Failed to read diary' });
        }
        res.json({ text: data });
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
