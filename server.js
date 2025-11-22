const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const apiLinks = require('./routes/apiLinks');
const redirect = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: process.env.APP_VERSION || '1.0' });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/links', apiLinks);

// Stats page route
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Redirect route -- must be after /code and /api
app.use('/', redirect);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => {
  console.log(`TinyLink listening on ${PORT}`);
});
