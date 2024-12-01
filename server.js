const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database opening error:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create users table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT)');

// Register route
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (row) {
      return res.send('Email already registered.');
    }

    // Insert new user
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err) => {
      if (err) {
        return res.send('Error registering user.');
      }
      res.send('Registration successful!');
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email exists and password matches
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (row) {
      res.send('Login successful!');
    } else {
      res.send('Invalid email or password.');
    }
  });
});

// Serve the login and registration form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
