// routes/auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const express = require('express');
const router = express.Router();

// User Registration Route
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) return res.status(500).send('Error: Username already exists.');
      res.status(200).send('User registered successfully!');
    }
  );
});

// User Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err || !user) return res.status(404).send('User not found.');

      // Verify the password
      if (!bcrypt.compareSync(password, user.password))
        return res.status(401).send('Incorrect password.');

      // Generate JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.status(200).send({ auth: true, token });
    }
  );
});

module.exports = router;
