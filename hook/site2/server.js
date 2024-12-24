const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

// 📌 **Update data and send webhook to Site 1**
app.post('/update-data', async (req, res) => {
    const { content } = req.body; // Get data from the form
    console.log('📨 Data received from form:', content);

    // Send a webhook to Site 1
    await axios.post('http://localhost:3000/webhook', { content });
    res.json({ message: 'Data updated and webhook sent' });
});

// 📌 **Serve the HTML for Page 2**
app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Page 2 - Update Data</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            padding: 20px 40px;
            width: 300px;
          }
          h1 {
            color: #333;
          }
          input {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔧 Update Data</h1>
          <input type="text" id="data" placeholder="Enter new data..." />
          <button onclick="updateData()">Submit</button>
        </div>

        <script>
          async function updateData() {
              const newData = document.getElementById('data').value;
              await fetch('/update-data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content: newData })
              });
              alert('Data has been updated!');
          }
        </script>
      </body>
      </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 Site 2 is running on http://localhost:${PORT}`);
});
