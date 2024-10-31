// routes/movies.js
const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth'); // Correctly import verifyToken
const axios = require('axios');
const router = express.Router();

// Search for Movies
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query,
        },
      }
    );
    res.status(200).json(response.data.results);
  } catch (error) {
    res.status(500).send('Error fetching movies.');
  }
});

// Get Movie Details
router.get('/details/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}`,
      { params: { api_key: process.env.TMDB_API_KEY } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching movie details.');
  }
});

// Rate a Movie
router.post('/rate', verifyToken, (req, res) => {
    const { movieId, rating } = req.body;
    const userId = req.userId; // This is set by verifyToken middleware
  
    // Validate the rating (e.g., ensure it's between 1 and 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }
  
    // SQL query to insert or replace the rating
    const query = `
      INSERT OR REPLACE INTO ratings (user_id, movie_id, rating)
      VALUES (?, ?, ?)
    `;
  
    db.run(query, [userId, movieId, rating], (err) => {
      if (err) {
        return res.status(500).send('Error saving rating.');
      }
      res.status(200).send('Rating saved successfully!');
    });
  });
  

module.exports = router;

