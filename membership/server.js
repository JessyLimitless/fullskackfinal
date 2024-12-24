const express = require('express'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const session = require('express-session'); 
const bcrypt = require('bcrypt'); 
const path = require('path');  

const app = express(); 
const PORT = 3000; 

// ========== MONGODB ATLAS CONNECTION (HARDCODED) ==========
const MONGODB_ATLAS_URI = '';

mongoose.connect(MONGODB_ATLAS_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

// ========== MONGOOSE SCHEMA AND MODEL ==========
const userSchema = new mongoose.Schema({ 
  username: { type: String, unique: true },  // Unique constraint for username
  email: String, 
  password: String 
}); 

const User = mongoose.model('User', userSchema); 

// ========== MIDDLEWARE ==========
app.use(bodyParser.json()); 
app.use(session({ 
  secret: 'SuperSecretKey', 
  resave: false, 
  saveUninitialized: true 
})); 
app.use(express.static(path.join(__dirname)));  

// ========== ROUTES ==========

// 1️⃣ **Register Route**
app.post('/register', async (req, res) => { 
  try {
    const { username, email, password } = req.body; 
    const hashedPassword = await bcrypt.hash(password, 10); 
    await User.create({ username, email, password: hashedPassword }); 
    res.json({ success: true, message: 'Registration successful!' }); 
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error for unique fields
      res.status(400).json({ success: false, message: 'Username already exists.' });
    } else {
      console.error('Error in /register:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
});  

// 2️⃣ **Login Route**
app.post('/login', async (req, res) => { 
  try {
    const { username, password } = req.body; 
    const user = await User.findOne({ username }); 
    if (!user || !await bcrypt.compare(password, user.password)) { 
      return res.status(400).json({ success: false, message: 'Invalid credentials.' }); 
    } 
    req.session.user = user; 
    res.json({ success: true, username: user.username }); 
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});  

// 3️⃣ **Logout Route**
app.post('/logout', (req, res) => { 
  req.session.destroy(); 
  res.json({ success: true }); 
});  

// ========== START THE SERVER ==========
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 
