const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const OFFICER_PASSWORD = process.env.OFFICER_PASSWORD;

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== OFFICER_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign({ role: 'officer' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

module.exports = router;
