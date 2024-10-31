// database.js
const sqlite3 = require('sqlite3').verbose();

// Open or create the database file
const db = new sqlite3.Database('cinemate.db', (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Initialize tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      user_id INTEGER,
      movie_id INTEGER,
      rating INTEGER,
      PRIMARY KEY (user_id, movie_id)
    );
  `);
});

module.exports = db;
