require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const registrationsRouter = require('./routes/registrations');
const authRouter = require('./routes/auth');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in backend/.env — copy backend/.env.example and fill it in.');
  process.exit(1);
}
if (!process.env.OFFICER_PASSWORD || !process.env.JWT_SECRET) {
  console.error('Missing OFFICER_PASSWORD or JWT_SECRET in backend/.env — copy backend/.env.example and fill it in.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/registrations', registrationsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Locker management API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
