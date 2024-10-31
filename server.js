// server.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies'); // Import movie routes
const recommendationRoutes = require('./routes/recommendations');

const app = express();
app.use(bodyParser.json());

// Register routes
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes); // Mount movies route
app.use('/recommendations', recommendationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
