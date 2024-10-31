// routes/recommendations.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../database');
const verifyToken = require('../middleware/auth');

// Recommendations with TMDb data based on user ratings and genres
router.get('/', verifyToken, async (req, res) => {
  const userId = req.userId;

  // Get all rated movies for the current user
  const userRatedQuery = `
    SELECT movie_id, rating
    FROM ratings
    WHERE user_id = ?
  `;

  db.all(userRatedQuery, [userId], async (err, userRatings) => {
    if (err) {
      return res.status(500).send('Error fetching user ratings.');
    }

    if (userRatings.length === 0) {
      // Fallback: Recommend high-quality movies if no user ratings
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
          params: {
            api_key: process.env.TMDB_API_KEY,
            sort_by: 'vote_average.desc',
            'vote_count.gte': 1000, // Movies with at least 1000 votes
            'vote_average.gte': 7.0, // Movies with a vote average of at least 7.0
            sort_by: 'popularity.desc', // Sort by popularity to get well-known movies
            language: 'en-US', // Optional: Filter to movies with English language
          },
        });
        return res.status(200).json(response.data.results.slice(0, 10)); // Return top 10 highly-rated popular movies
      } catch (error) {
        return res.status(500).send('Error fetching high-quality fallback movies.');
      }
    } else {
      // Recommend movies based on genres of rated movies
      const genreCounts = {};

      // Fetch genres of each rated movie from TMDb
      for (const movie of userRatings) {
        try {
          const response = await axios.get(`https://api.themoviedb.org/3/movie/${movie.movie_id}`, {
            params: {
              api_key: process.env.TMDB_API_KEY,
            },
          });
          const genres = response.data.genres;

          // Count genre frequencies
          genres.forEach((genre) => {
            if (!genreCounts[genre.id]) {
              genreCounts[genre.id] = 0;
            }
            genreCounts[genre.id]++;
          });
        } catch (error) {
          console.error(`Error fetching genres for movie ID ${movie.movie_id}:`, error.message);
        }
      }

      // Sort genres by frequency
      const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

      // Recommend movies from the most common genres
      let recommendedMovies = [];
      for (const genreId of sortedGenres) {
        if (recommendedMovies.length >= 10) break;

        try {
          const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
              api_key: process.env.TMDB_API_KEY,
              with_genres: genreId,
              sort_by: 'vote_average.desc',
              'vote_count.gte': 500, // Optional: Consider movies with a minimum vote count
            },
          });
          recommendedMovies = recommendedMovies.concat(response.data.results.slice(0, 5)); // Add top 5 movies per genre
        } catch (error) {
          console.error(`Error fetching recommendations for genre ID ${genreId}:`, error.message);
        }
      }

      // Return top 10 recommendations
      return res.status(200).json(recommendedMovies.slice(0, 10));
    }
  });
});

module.exports = router;
