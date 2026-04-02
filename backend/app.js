const express = require('express');
const cors = require('cors');

// Import Main Router
const routes = require('./src/routes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

// API Routes prefix
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;
