// middleware/auth.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send('No token provided.');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    
    // If valid, store user ID in req.userId for access in the next middleware or route
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
