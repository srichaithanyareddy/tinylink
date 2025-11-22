require('dotenv').config();           // <-- LOAD .env FIRST

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const apiLinks = require('./routes/apiLinks');
const redirect = require('./routes/redirect');

const app = express();

// Debug: confirm env loaded
console.log("Loaded PORT:", process.env.PORT);

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: process.env.APP_VERSION || '1.0' });
});

// static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/links', apiLinks);

// Stats page
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Redirect
app.use('/', redirect);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

// LISTEN - ONLY ONCE
console.log("About to call app.listen...");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`TinyLink listening on ${PORT}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on", PORT));
