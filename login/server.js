const express = require('express'); 
const session = require('express-session');  

const app = express();  

// ========== MIDDLEWARE ========== 
app.use(express.urlencoded({ extended: true }));  

app.use(session({     
    secret: 'superSecretKey123',     
    resave: false,     
    saveUninitialized: true 
})); 

app.use(express.static('public')); // Serve static files from 'public' folder  

// ========== HARDCODED PASSWORD ========== 
const HARD_CODED_PASSWORD = '1234';  

// ========== ROUTES ==========  

// 1️⃣ **Serve the login page** 
app.get('/', (req, res) => {     
    if (req.session.loggedIn) {         
        return res.redirect('/messenger.html');     
    }     
    res.sendFile(__dirname + '/public/index.html'); // Serve index.html 
});  

// 2️⃣ **Handle password login** 
app.post('/login', (req, res) => {     
    const { password } = req.body;      

    if (password === HARD_CODED_PASSWORD) {         
        req.session.loggedIn = true;         
        res.redirect('/messenger.html'); // Redirect to messenger page     
    } else {         
        res.redirect('/?error=1'); // Show error message     
    } 
});  

// 3️⃣ **Serve the messenger page (only if logged in)** 
app.get('/messenger.html', (req, res) => {     
    if (!req.session.loggedIn) {         
        return res.redirect('/'); // Redirect to login if not logged in     
    }     
    res.sendFile(__dirname + '/public/messenger.html'); // Serve messenger.html 
});  

// 4️⃣ **Logout route** 
app.get('/logout', (req, res) => {     
    req.session.destroy(() => {         
        res.redirect('/'); // End session and redirect to login page     
    }); 
});  

// Start the server 
const PORT = 3000; 
app.listen(PORT, () => {     
    console.log(`Server is running on http://localhost:${PORT}`); 
});
