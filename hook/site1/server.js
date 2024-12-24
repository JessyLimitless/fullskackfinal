const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow cross-origin requests from Site 2
app.use(cors({ origin: 'http://localhost:4000' }));
app.use(bodyParser.json());

// Store the latest data sent from Site 2
let latestData = { content: 'No updates yet' };

// 📌 **Webhook endpoint** to receive data from Site 2
app.post('/webhook', (req, res) => {
    const { content } = req.body; // Receive data from Site 2
    latestData.content = content; // Store the data
    console.log('📨 Webhook received:', content);
    res.json({ message: 'Webhook received successfully', content });
});

// 📌 **API endpoint to send the latest data to Page 1**
app.get('/latest-data', (req, res) => {
    res.json(latestData); // Send the latest data to the client
});

// 📌 **Serve the HTML for Page 1**
app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Page 1 - Real-Time Data</title>
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
          #data-container {
            font-size: 1.5rem;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Real-Time Data</h1>
          <div id="data-container">
            <p>Waiting for updates...</p>
          </div>
        </div>

        <script>
          async function getData() {
              const response = await fetch('/latest-data');
              const data = await response.json();
              document.getElementById('data-container').innerText = \`Updated Data: \${data.content}\`;
          }
          setInterval(getData, 5000); // Check for new data every 5 seconds
        </script>
      </body>
      </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`🌐 Site 1 is running on http://localhost:${PORT}`);
});
